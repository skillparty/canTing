const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'general';
    
    // Determinar subdirectorio basado en el tipo de archivo
    if (file.fieldname === 'logo') {
      subDir = 'logos';
    } else if (file.fieldname === 'menu_image') {
      subDir = 'menu-items';
    } else if (file.fieldname === 'qr_image') {
      subDir = 'qr-codes';
    }
    
    const fullPath = path.join(uploadDir, subDir);
    
    // Crear subdirectorio si no existe
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    // Limpiar nombre del archivo
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    
    cb(null, `${cleanBaseName}-${uniqueSuffix}${extension}`);
  }
});

// Filtro para tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Configuración base de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Solo un archivo por request
  }
});

// Middleware específicos para diferentes tipos de upload
const uploadLogo = upload.single('logo');
const uploadMenuImage = upload.single('menu_image');
const uploadQRImage = upload.single('qr_image');

// Middleware para manejar múltiples archivos (si es necesario en el futuro)
const uploadMultiple = upload.array('images', 5); // Máximo 5 imágenes

// Middleware para procesar errores de multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
        }
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Demasiados archivos. Máximo permitido: 5'
        }
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNEXPECTED_FILE',
          message: 'Campo de archivo inesperado'
        }
      });
    }
  }
  
  if (err.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: err.message
      }
    });
  }
  
  next(err);
};

// Función para generar URL pública del archivo
const getFileUrl = (req, filename, subDir = 'general') => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${subDir}/${filename}`;
};

// Función para eliminar archivo
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Middleware para validar que el archivo fue subido correctamente
const validateUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE_UPLOADED',
        message: 'No se subió ningún archivo'
      }
    });
  }
  
  // Agregar URL pública del archivo a la request
  const subDir = req.file.destination.split('/').pop();
  req.file.url = getFileUrl(req, req.file.filename, subDir);
  
  next();
};

// Función para limpiar archivos antiguos (opcional, para mantenimiento)
const cleanupOldFiles = (directory, maxAge = 30 * 24 * 60 * 60 * 1000) => { // 30 días por defecto
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      
      const now = Date.now();
      const deletePromises = [];
      
      files.forEach(file => {
        const filePath = path.join(directory, file);
        fs.stat(filePath, (err, stats) => {
          if (!err && (now - stats.mtime.getTime()) > maxAge) {
            deletePromises.push(deleteFile(filePath));
          }
        });
      });
      
      Promise.all(deletePromises)
        .then(() => resolve())
        .catch(reject);
    });
  });
};

module.exports = {
  upload,
  uploadLogo,
  uploadMenuImage,
  uploadQRImage,
  uploadMultiple,
  handleUploadError,
  validateUpload,
  getFileUrl,
  deleteFile,
  cleanupOldFiles
};