// permissions/user.js
export const USER_PERMISSIONS = {
  USER: {
    CREATE: 'user:create',
    READ: 'user:read',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    BULK_DELETE: 'user:bulk_delete',
    BULK_UPLOAD:'user:bulk_upload',
    ACTIVATE: 'user:activate',
    DEACTIVATE: 'user:deactivate',
    ASSIGN_ROLE: 'user:assign_role',
    PATIENT_TYPE: 'user:patient_type',
  },
  PATIENT:{
    CREATE: 'patient:create',
    READ: 'patient:read',
    UPDATE: 'patient:update',
    DELETE: 'patient:delete',
    BULK_DELETE: 'patient:bulk_delete',
    BULK_UPLOAD:'patient:bulk_upload',
    ACTIVATE: 'patient:activate',
    DEACTIVATE: 'patient:deactivate',
    ASSIGN_ROLE: 'patient:assign_role',
    PATIENT_TYPE: 'patient:patient_type',
  }
};