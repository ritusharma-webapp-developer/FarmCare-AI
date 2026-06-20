import os
import uuid
import logging
import datetime
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Try to initialize firebase-admin
firebase_initialized = False
db = None
bucket = None

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, storage
    
    # Check if firebase is already initialized
    if not firebase_admin._apps:
        # Check for service account credentials file
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        firebase_config = os.environ.get("FIREBASE_CONFIG")
        bucket_name = os.environ.get("FIREBASE_STORAGE_BUCKET")
        
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {'storageBucket': bucket_name})
            firebase_initialized = True
        elif firebase_config:
            # Inline config or JSON string
            import json
            config_dict = json.loads(firebase_config)
            cred = credentials.Certificate(config_dict)
            firebase_admin.initialize_app(cred, {'storageBucket': bucket_name})
            firebase_initialized = True
        else:
            # Try Default Application Credentials
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, {'storageBucket': bucket_name})
            firebase_initialized = True
            
        if firebase_initialized:
            db = firestore.client()
            try:
                bucket = storage.bucket()
            except Exception as e:
                logger.warning(f"Firebase Storage bucket not configured: {e}")
            logger.info("Firebase Admin SDK successfully initialized.")
except Exception as e:
    logger.warning(f"Could not initialize Firebase Admin SDK (switching to Demo Mode): {e}")

# =============================================================================
# In-Memory Mock Firestore Implementation
# =============================================================================

class MockDocumentSnapshot:
    def __init__(self, doc_id: str, data: Dict[str, Any]):
        self.id = doc_id
        self.exists = data is not None
        self._data = data if data else {}
        
    def to_dict(self) -> Dict[str, Any]:
        return self._data

class MockDocumentReference:
    def __init__(self, collection_data: Dict[str, Any], doc_id: str):
        self.collection_data = collection_data
        self.id = doc_id
        
    def get(self) -> MockDocumentSnapshot:
        data = self.collection_data.get(self.id)
        return MockDocumentSnapshot(self.id, data)
        
    def set(self, data: Dict[str, Any], merge: bool = False):
        if merge and self.id in self.collection_data:
            self.collection_data[self.id].update(data)
        else:
            self.collection_data[self.id] = data
        return self
        
    def update(self, data: Dict[str, Any]):
        if self.id in self.collection_data:
            self.collection_data[self.id].update(data)
        else:
            self.collection_data[self.id] = data
        return self
        
    def delete(self):
        if self.id in self.collection_data:
            del self.collection_data[self.id]

class MockCollectionQuery:
    def __init__(self, collection_data: Dict[str, Any]):
        self.collection_data = collection_data
        
    def stream(self) -> List[MockDocumentSnapshot]:
        return [MockDocumentSnapshot(k, v) for k, v in self.collection_data.items()]

class MockCollectionReference:
    def __init__(self, collection_data: Dict[str, Any]):
        self.collection_data = collection_data
        
    def document(self, doc_id: Optional[str] = None) -> MockDocumentReference:
        if not doc_id:
            doc_id = str(uuid.uuid4())
        return MockDocumentReference(self.collection_data, doc_id)
        
    def stream(self) -> List[MockDocumentSnapshot]:
        return [MockDocumentSnapshot(k, v) for k, v in self.collection_data.items()]
        
    def where(self, field: str, op: str, value: Any) -> MockCollectionQuery:
        filtered = {}
        for k, v in self.collection_data.items():
            field_val = v.get(field)
            match = False
            if op == "==" and field_val == value:
                match = True
            elif op == "in" and isinstance(value, list) and field_val in value:
                match = True
            if match:
                filtered[k] = v
        return MockCollectionQuery(filtered)

class MockFirestoreClient:
    def __init__(self):
        self._data = {
            "farmers": {
                "demo-farmer": {
                    "id": "demo-farmer",
                    "name": "Demo Farmer",
                    "location": "California, USA",
                    "crop_history": ["Tomato", "Maize"],
                    "created_at": datetime.datetime.now().isoformat()
                }
            },
            "diagnosis_history": {},
            "recommendations": {}
        }
        
    def collection(self, collection_name: str) -> MockCollectionReference:
        if collection_name not in self._data:
            self._data[collection_name] = {}
        return MockCollectionReference(self._data[collection_name])

# Instantiated client for fallback
mock_db = MockFirestoreClient()

# =============================================================================
# Helper Database Operations (Transparently switching Firestore vs Fallback)
# =============================================================================

def save_crop_image(image_bytes: bytes, filename: str) -> str:
    """Saves crop image to Firebase Storage if available, otherwise to a local upload directory."""
    safe_filename = f"{uuid.uuid4()}_{filename}"
    
    if bucket:
        try:
            blob = bucket.blob(f"crop_images/{safe_filename}")
            blob.upload_from_string(image_bytes, content_type="image/jpeg")
            blob.make_public()
            return blob.public_url
        except Exception as e:
            logger.warning(f"Could not upload to Firebase Storage (falling back to local): {e}")
            
    # Fallback to local storage (served under /static/uploads)
    static_uploads_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "static",
        "uploads"
    )
    os.makedirs(static_uploads_dir, exist_ok=True)
    file_path = os.path.join(static_uploads_dir, safe_filename)
    with open(file_path, "wb") as f:
        f.write(image_bytes)
        
    return f"/static/uploads/{safe_filename}"

def get_farmer(farmer_id: str) -> Dict[str, Any]:
    """Retrieves farmer details from database, falling back to mock client on error."""
    if db:
        try:
            doc = db.collection("farmers").document(farmer_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            logger.warning(f"Firestore get_farmer failed (using mock database): {e}")
            
    # Fallback path
    doc = mock_db.collection("farmers").document(farmer_id).get()
    if doc.exists:
        return doc.to_dict()
        
    default_profile = {
        "id": farmer_id,
        "name": "Demo Farmer" if farmer_id == "demo-farmer" else f"Farmer {farmer_id[:4]}",
        "location": "California, USA",
        "crop_history": ["Tomato"],
        "created_at": datetime.datetime.now().isoformat()
    }
    mock_db.collection("farmers").document(farmer_id).set(default_profile)
    return default_profile

def save_diagnosis(
    farmer_id: str,
    crop_name: str,
    location: str,
    symptoms: str,
    image_url: Optional[str]
) -> str:
    """Saves a diagnosis event and returns the diagnosis ID."""
    diagnosis_id = f"diag_{uuid.uuid4().hex[:12]}"
    diagnosis_data = {
        "id": diagnosis_id,
        "farmer_id": farmer_id,
        "crop_name": crop_name,
        "location": location,
        "symptoms": symptoms,
        "image_url": image_url,
        "timestamp": datetime.datetime.now().isoformat(),
        "status": "completed"
    }
    
    saved_real = False
    if db:
        try:
            db.collection("diagnosis_history").document(diagnosis_id).set(diagnosis_data)
            saved_real = True
            
            # Also update crop history in farmer profile
            farmer = get_farmer(farmer_id)
            history = farmer.get("crop_history", [])
            if crop_name not in history:
                history.append(crop_name)
                db.collection("farmers").document(farmer_id).update({"crop_history": history})
        except Exception as e:
            logger.warning(f"Firestore save_diagnosis failed (using mock database): {e}")
            
    # Always update mock so they remain synchronized
    mock_db.collection("diagnosis_history").document(diagnosis_id).set(diagnosis_data)
    farmer = get_farmer(farmer_id)
    history = farmer.get("crop_history", [])
    if crop_name not in history:
        history.append(crop_name)
        mock_db.collection("farmers").document(farmer_id).update({"crop_history": history})
        
    return diagnosis_id

def save_recommendation(
    diagnosis_id: str,
    analysis_data: Dict[str, Any]
) -> str:
    """Saves agent recommendation matched with diagnosis ID."""
    rec_id = f"rec_{uuid.uuid4().hex[:12]}"
    rec_data = {
        "id": rec_id,
        "diagnosis_id": diagnosis_id,
        "crop_analysis": analysis_data.get("crop_analysis"),
        "weather_analysis": analysis_data.get("weather_analysis"),
        "market_analysis": analysis_data.get("market_analysis"),
        "recommendation": analysis_data.get("recommendation"),
        "created_at": datetime.datetime.now().isoformat()
    }
    
    if db:
        try:
            db.collection("recommendations").document(rec_id).set(rec_data)
            db.collection("diagnosis_history").document(diagnosis_id).update({
                "recommendation_ref": rec_id,
                "analysis_result": analysis_data
            })
        except Exception as e:
            logger.warning(f"Firestore save_recommendation failed (using mock database): {e}")
            
    mock_db.collection("recommendations").document(rec_id).set(rec_data)
    mock_db.collection("diagnosis_history").document(diagnosis_id).update({
        "recommendation_ref": rec_id,
        "analysis_result": analysis_data
    })
    
    return rec_id

def get_diagnosis_history(farmer_id: str) -> List[Dict[str, Any]]:
    """Lists history of diagnosis and recommendations for a farmer."""
    history = []
    
    if db:
        try:
            snapshots = db.collection("diagnosis_history").where("farmer_id", "==", farmer_id).stream()
            for snap in snapshots:
                doc_data = snap.to_dict()
                rec_ref = doc_data.get("recommendation_ref")
                if rec_ref:
                    rec_snap = db.collection("recommendations").document(rec_ref).get()
                    if rec_snap.exists:
                        doc_data["recommendation"] = rec_snap.to_dict()
                history.append(doc_data)
            
            if history:
                history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
                return history
        except Exception as e:
            logger.warning(f"Firestore get_diagnosis_history failed (falling back to mock database): {e}")
            
    # Fallback to mock
    history = []
    snapshots = mock_db.collection("diagnosis_history").where("farmer_id", "==", farmer_id).stream()
    for snap in snapshots:
        doc_data = snap.to_dict()
        rec_ref = doc_data.get("recommendation_ref")
        if rec_ref:
            rec_snap = mock_db.collection("recommendations").document(rec_ref).get()
            if rec_snap.exists:
                doc_data["recommendation"] = rec_snap.to_dict()
        history.append(doc_data)
        
    history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return history
