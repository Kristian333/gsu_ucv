// Diccionario general de errores de red o servidor
const GLOBAL_ERRORS: Record<string, string> = {
  // Red y conectividad
  "network error": "No hay conexión a internet. Revisa tu red.",
  "failed to fetch": "No se pudo conectar con el servidor. Revisa tu conexión a internet.",

  // Autenticación y Tokens
  "invalid or expired authorization token": "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
  "token is expired": "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
  "invalid authorization token": "Sesión inválida. Por favor inicia sesión de nuevo.",
  "unauthorized": "Tu sesión ha expirado. Por favor inicia sesión de nuevo.",
  "http_401": "Tu sesión ha expirado o no estás autorizado. Por favor inicia sesión de nuevo.",

  // Servidor y estado HTTP general
  "internal server error": "Ocurrió un problema en el servidor. Inténtalo más tarde.",
  "http_500": "Error interno del servidor. Inténtalo más tarde.",
  "http_502": "El servidor de la DEU no responde momentáneamente. Inténtalo más tarde.",
  "http_503": "El servicio no está disponible temporalmente. Inténtalo más tarde.",
  "http_504": "El tiempo de espera con el servidor ha expirado.",
  "http_404": "El recurso solicitado no fue encontrado.",
  "http_403": "No tienes permiso para realizar esta acción.",

  // Errores provenientes de httperrors (errors.go / handler.go)
  "there was an internal error. contact an administrator or try again later":
    "Ocurrió un error interno en el servidor. Contacta al administrador o inténtalo más tarde.",
  "invalid request": "La solicitud realizada no es válida. Revisa los datos enviados.",
  "forbidden": "No tienes permiso para realizar esta acción.",
  "resource not found": "El recurso solicitado no fue encontrado.",
  "resource already exists": "El recurso que intentas registrar ya existe.",
  "unprocessable entity": "La solicitud no se pudo procesar debido a datos no válidos.",
  "an error occurred": "Ocurrió un error inesperado al procesar la solicitud.",

  // Servicio de Correo Electrónico (Mailgun / Email Service)
  "failed to send email": "Ocurrió un error al enviar el correo electrónico de notificación. Inténtalo de nuevo.",
  "email delivery failed": "No se pudo entregar el correo electrónico. Verifica la dirección ingresada.",
  "email provider error": "Error en el proveedor de correos. Si el problema persiste, contacta a la DEU.",
  "email send timeout": "El tiempo de espera para enviar el correo expiró. Revisa tu conexión e inténtalo de nuevo.",
};

// Diccionario de errores del módulo de Login
const LOGIN_ERRORS: Record<string, string> = {
  "invalid credentials": "El usuario o la contraseña son incorrectos.",
  "user not found": "No existe una cuenta registrada con estas credenciales.",
  "http_401": "El usuario o la contraseña son incorrectos.",
};

// Diccionario de errores del módulo de Registro de Usuarios
const REGISTER_ERRORS: Record<string, string> = {
  "user already exists": "Ya existe una cuenta registrada con esta cédula o correo electrónico.",
  "validation failed": "Los datos ingresados no son válidos. Por favor, revisa el formulario.",
  "invalid profile picture": "El archivo de la foto de perfil no es válido.",
  "fecha_de_nacimiento debe estar en formato dd-mm-yyyy": "La fecha de nacimiento debe estar en formato DD-MM-AAAA.",
  "http_409": "Ya existe un usuario registrado con estos datos.",
  "http_400": "Los datos enviados son incorrectos o están incompletos.",
};

// Diccionario de errores del módulo de Gestión de Usuarios (Perfil, Lista, Edición, Eliminación)
const USER_ERRORS: Record<string, string> = {
  // Errores de dominio y negocio (errors.go / endpoints.go)
  "user not found": "El usuario solicitado no existe o fue eliminado.",
  "user already exists": "Ya existe un usuario registrado con estas credenciales.",
  "invalid input": "Los datos proporcionados para el usuario no son válidos.",

  // Validaciones del payload y parámetros (endpoints.go / decoders.go)
  "invalid request body": "El formato de los datos del usuario no es válido.",
  "validation failed": "Los datos ingresados no son válidos. Por favor, revisa los campos.",
  "fecha_de_nacimiento debe estar en formato dd-mm-yyyy": "La fecha de nacimiento debe tener el formato DD-MM-AAAA.",

  // Códigos HTTP de respaldo
  "http_400": "Los datos del usuario son incorrectos o están incompletos.",
  "http_403": "No tienes permisos para consultar o modificar esta información de usuario.",
  "http_404": "El usuario solicitado no fue encontrado.",
  "http_500": "Ocurrió un error interno en el servidor al procesar la información del usuario.",
};

// Diccionario de errores del módulo de Actividades
const ACTIVITY_ERRORS: Record<string, string> = {
  // Autenticación y permisos
  "authentication required": "Se requiere autenticación para esta acción. Por favor, inicia sesión de nuevo.",
  "http_401": "No estás autorizado para realizar esta acción.",

  // Validaciones de IDs y formato
  "activity id is required": "El identificador de la actividad es obligatorio.",
  "group id is required": "El identificador del grupo es obligatorio.",
  "invalid request body": "El formato de los datos enviados no es válido.",
  "invalid query parameters": "Los parámetros de búsqueda o filtrado no son válidos.",

  // Archivos adjuntos
  "cover image is required": "Debe adjuntar la imagen de cubierta o referencial de la actividad.",
  "failed to upload activity files": "Ocurrió un error al subir los archivos de la actividad al almacenamiento.",
  "failed to upload updated activity files": "Ocurrió un error al subir la actualización de los archivos al almacenamiento.",
  "failed to save activity files to db": "Error al vincular los archivos guardados en la base de datos.",
  "failed to save updated activity files to db": "Error al actualizar la vinculación de los archivos en la base de datos.",

  // Filtros de Fecha
  "start_date is required when end_date is provided": "Debes especificar la fecha de inicio si ingresas una fecha final.",
  "start_date must be in dd-mm-yyyy format": "La fecha de inicio debe tener el formato DD-MM-AAAA.",
  "end_date must be in dd-mm-yyyy format": "La fecha final debe tener el formato DD-MM-AAAA.",
  "start_date must not be after end_date": "La fecha de inicio no puede ser posterior a la fecha final.",

  // Errores de Dominio / Negocio
  "activity not found": "La actividad solicitada no existe o fue eliminada.",
  "maximum featured activities limit reached for this group": "Solo se pueden destacar un máximo de 4 actividades por grupo.",
  "solo se pueden destacar un máximo de 4 actividades por grupo": "Solo se pueden destacar un máximo de 4 actividades por grupo.",
  "failed to create activity": "No se pudo registrar la actividad en el sistema.",

  // Códigos HTTP de respaldo
  "http_400": "Los datos de la actividad son inválidos o están incompletos.",
  "http_403": "No estás autorizado para realizar esta acción.",
  "http_404": "La actividad no fue encontrada.",
  "http_500": "Ocurrió un error en el servidor al procesar la actividad.",
};

// Diccionario de errores del módulo de Analíticas de Grupo
const GROUP_ANALYTICS_ERRORS: Record<string, string> = {
  // Respuestas directas del backend (endpoints.go)
  "datos de consulta inválidos": "Los parámetros del filtro de analíticas son inválidos o están incompletos.",
  "error al generar analíticas de grupos": "No se pudieron obtener los datos analíticos del grupo. Inténtalo más tarde.",

  // Registros de error internos / Log messages (service.go)
  "error retrieving activity participants": "Error al consultar las métricas de participantes en actividades.",
  "error retrieving activities by state": "Error al consultar la distribución de actividades por estado.",
  "error retrieving group participants": "Error al consultar los datos de participantes del grupo.",
  "error retrieving activities by city": "Error al consultar la ubicación geográfica de las actividades.",
  "error retrieving yearly history": "Error al obtener el historial anual de actividades.",
  "error retrieving knowledge areas by year": "Error al procesar la distribución por áreas de conocimiento.",

  // Códigos HTTP de respaldo
  "http_400": "Los filtros aplicados para la consulta de analíticas no son válidos.",
  "http_500": "Error en el servidor al generar el reporte analítico del grupo.",
};

// Diccionario de errores del módulo de Dashboards (Grupo, Facultad, DEU)
const DASHBOARD_ERRORS: Record<string, string> = {
  // Respuestas directas del backend (endpoints.go)
  "identificador de grupo inválido": "El ID del grupo proporcionado no es válido o está incompleto.",
  "nombre de facultad inválido": "El nombre de la facultad ingresado no es válido.",
  "error al consultar dashboard del grupo": "No se pudieron cargar los datos del panel del grupo. Inténtalo de nuevo.",
  "error al consultar dashboard de facultad": "No se pudieron cargar los datos del panel de la facultad. Inténtalo de nuevo.",
  "error al consultar dashboard deu": "No se pudieron cargar los datos del panel general de la DEU.",

  // Registros de error internos / Log messages (service.go)
  "error retrieving group dashboard metrics": "Error al obtener las métricas de actividades del grupo.",
  "error retrieving faculty dashboard metrics": "Error al obtener las solicitudes de recursos de la facultad.",
  "error retrieving deu dashboard metrics": "Error al consultar las métricas globales de la DEU.",

  // Códigos HTTP de respaldo
  "http_400": "La solicitud al panel de control contiene parámetros inválidos.",
  "http_404": "El panel de control solicitado no existe.",
  "http_500": "Error interno del servidor al procesar las métricas del panel.",
};

// Diccionario de errores del módulo de Grupos de Extensión
const GROUP_ERRORS: Record<string, string> = {
  // Autenticación y permisos
  "authentication required": "Se requiere autenticación para realizar esta acción. Inicia sesión de nuevo.",

  // Errores de dominio y negocio
  "group not found": "El grupo de extensión solicitado no existe o fue eliminado.",

  // Validaciones del payload y parámetros de consulta
  "invalid request body": "El formato de los datos enviados no es válido.",
  "validation failed": "Los datos del formulario son inválidos o están incompletos. Por favor, revisa los campos.",
  "active must be true or false": "El parámetro de estado activo debe ser un valor booleano (true/false).",
  "deleted must be true or false": "El parámetro de estado eliminado debe ser un valor booleano (true/false).",
  "miembros: formato inválido": "La lista de miembros del grupo posee un formato JSON inválido.",

  // Archivos adjuntos requeridos
  "logo is required": "El logotipo del grupo de extensión es obligatorio.",
  "project file is required": "El archivo del proyecto del grupo es obligatorio.",

  // Errores provenientes de service.go
  "failed to generate provider code": "Error al generar el código único de proveedor para el grupo.",
  "failed to create group with requests": "No se pudo registrar la solicitud de creación del grupo en el sistema.",
  "failed to upload files": "Ocurrió un error al subir los documentos adjuntos del grupo al almacenamiento.",
  "failed to upload group files": "Ocurrió un error al subir la actualización de archivos del grupo.",
  "failed to save files": "Ocurrió un error al registrar los archivos en la base de datos.",
  "failed to update group files": "Error al actualizar el registro de los archivos del grupo en la base de datos.",

  // Códigos HTTP de respaldo
  "http_400": "Los datos enviados para el grupo de extensión son incorrectos.",
  "http_403": "No tienes permisos para modificar o consultar este grupo de extensión.",
  "http_404": "El grupo de extensión no fue encontrado.",
  "http_500": "Ocurrió un error en el servidor al procesar la solicitud del grupo.",
};

// Diccionario de errores del módulo de Solicitudes de Creación de Grupo (Group Requests)
const GROUP_REQUEST_ERRORS: Record<string, string> = {
  // Validaciones de entrada (endpoints.go)
  "request id is required": "El identificador de la solicitud de grupo es obligatorio.",
  "invalid faculty": "La facultad especificada no es válida.",
  "invalid page number": "El número de página ingresado no es válido.",
  "invalid page size": "El tamaño de página especificado no es válido.",

  // Errores de dominio (errors.go / endpoints.go)
  "group request not found": "La solicitud de creación de grupo no fue encontrada o fue eliminada.",

  // Códigos HTTP de respaldo
  "http_400": "La solicitud enviada contiene parámetros inválidos.",
  "http_403": "No tienes permiso para gestionar solicitudes de grupo.",
  "http_404": "La solicitud de grupo solicitada no fue encontrada.",
  "http_500": "Error en el servidor al procesar la solicitud del grupo.",
};

// Diccionario de errores del módulo de Solicitudes de Recursos (Resource Requests)
const RESOURCE_REQUEST_ERRORS: Record<string, string> = {
  // Validaciones de entrada y parámetros de consulta (endpoints.go)
  "invalid request body": "El formato de los datos de la solicitud no es válido.",
  "validation failed": "Los datos de la solicitud están incompletos o son inválidos.",
  "request id is required": "El identificador de la solicitud de recurso es obligatorio.",
  "groupid is required": "El identificador del grupo de extensión es obligatorio.",
  "invalid faculty": "La facultad especificada para filtrar las solicitudes no es válida.",

  // Errores de dominio (errors.go / endpoints.go)
  "group resource request not found": "La solicitud de recurso no fue encontrada o fue eliminada.",

  // Registros de error internos / Log messages (service.go)
  "failed to create group resource request": "No se pudo registrar la solicitud de recurso en el sistema.",
  "failed to get group resource requests by faculty": "Error al consultar las solicitudes de recursos de la facultad.",
  "failed to get group resource requests by group id": "Error al consultar las solicitudes de recursos del grupo.",
  "failed to get pending group resource requests count by faculty": "Error al obtener la cantidad de solicitudes de recursos pendientes.",

  // Códigos HTTP de respaldo
  "http_400": "Los datos enviados para la solicitud de recursos no son válidos.",
  "http_403": "No tienes permiso para realizar o gestionar solicitudes de recursos.",
  "http_404": "La solicitud de recurso solicitada no fue encontrada.",
  "http_500": "Ocurrió un error en el servidor al procesar la solicitud de recurso.",
};

export const getLoginErrorMessage = (rawError: string): string => {
  if (!rawError) return "Ocurrió un error inesperado. Inténtalo de nuevo. Si el error persiste, por favor contactar a la DEU.";

  const normalizedError = rawError.trim().toLowerCase();

  if (LOGIN_ERRORS[normalizedError]) {
    return LOGIN_ERRORS[normalizedError];
  }

  if (GLOBAL_ERRORS[normalizedError]) {
    return GLOBAL_ERRORS[normalizedError];
  }

  if (normalizedError.includes("petición")) {
    return "No se pudo conectar con el servidor. Verifica tu conexión.";
  }

  return "Ocurrió un error al intentar iniciar sesión. Inténtalo de nuevo. Si el error persiste, por favor contactar a la DEU.";
};

export const getRegisterErrorMessage = (rawError: string): string => {
  if (!rawError) {
    return "Ocurrió un error inesperado al registrar el usuario. Inténtalo de nuevo.";
  }

  const normalizedError = rawError.trim().toLowerCase();

  if (REGISTER_ERRORS[normalizedError]) {
    return REGISTER_ERRORS[normalizedError];
  }

  if (GLOBAL_ERRORS[normalizedError]) {
    return GLOBAL_ERRORS[normalizedError];
  }

  if (normalizedError.includes("error con la fecha de nacimiento")) {
    return "La fecha de nacimiento ingresada no es válida. Revisa el formato DD-MM-AAAA.";
  }

  if (normalizedError.includes("petición") || normalizedError.includes("failed to fetch")) {
    return "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
  }

  return "Ocurrió un error al procesar el registro. Inténtalo de nuevo. Si el problema persiste, contacta a la DEU.";
};

export const getUserErrorMessage = (rawError: string): string => {
  if (!rawError) {
    return "Ocurrió un error inesperado al procesar la información del usuario. Inténtalo de nuevo.";
  }

  const normalizedError = rawError.trim().toLowerCase();

  if (USER_ERRORS[normalizedError]) {
    return USER_ERRORS[normalizedError];
  }

  if (GLOBAL_ERRORS[normalizedError]) {
    return GLOBAL_ERRORS[normalizedError];
  }

  // Manejo de patrones dinámicos de decoders.go
  if (normalizedError.includes("error con la fecha de nacimiento")) {
    return "La fecha de nacimiento ingresada no es válida. Revisa el formato DD-MM-AAAA.";
  }

  if (normalizedError.includes("petición") || normalizedError.includes("failed to fetch")) {
    return "No se pudo conectar con el servidor backend. Verifica tu conexión a internet.";
  }

  return "Ocurrió un error al procesar la información del usuario. Inténtalo de nuevo. Si el problema persiste, contacta a la DEU.";
};

export const getActivityErrorMessage = (rawError: string): string => {
  if (!rawError) {
    return "Ocurrió un error inesperado al procesar la actividad. Inténtalo de nuevo.";
  }

  const normalizedError = rawError.trim().toLowerCase();

  if (ACTIVITY_ERRORS[normalizedError]) {
    return ACTIVITY_ERRORS[normalizedError];
  }

  if (GLOBAL_ERRORS[normalizedError]) {
    return GLOBAL_ERRORS[normalizedError];
  }

  if (normalizedError.includes("petición") || normalizedError.includes("failed to fetch")) {
    return "No se pudo conectar con el servidor backend. Verifica tu conexión a internet.";
  }

  return "Ocurrió un error al procesar la actividad. Inténtalo de nuevo. Si el problema persiste, contacta a la DEU.";
};

export const getGroupAnalyticsErrorMessage = (rawError: string): string => {
  if (!rawError) {
    return "Ocurrió un error inesperado al cargar las analíticas del grupo. Inténtalo de nuevo.";
  }

  const normalizedError = rawError.trim().toLowerCase();

  if (GROUP_ANALYTICS_ERRORS[normalizedError]) {
    return GROUP_ANALYTICS_ERRORS[normalizedError];
  }

  if (GLOBAL_ERRORS[normalizedError]) {
    return GLOBAL_ERRORS[normalizedError];
  }

  if (normalizedError.includes("petición") || normalizedError.includes("failed to fetch")) {
    return "No se pudo conectar con el servidor backend. Verifica tu conexión a internet.";
  }

  return "Ocurrió un error al consultar las analíticas. Inténtalo de nuevo. Si el problema persiste, contacta a la DEU.";
};

export const getDashboardErrorMessage = (rawError: string): string => {
  if (!rawError) {
    return "Ocurrió un error inesperado al cargar la información del panel. Inténtalo de nuevo.";
  }

  const normalizedError = rawError.trim().toLowerCase();

  if (DASHBOARD_ERRORS[normalizedError]) {
    return DASHBOARD_ERRORS[normalizedError];
  }

  if (GLOBAL_ERRORS[normalizedError]) {
    return GLOBAL_ERRORS[normalizedError];
  }

  if (normalizedError.includes("petición") || normalizedError.includes("failed to fetch")) {
    return "No se pudo conectar con el servidor backend. Verifica tu conexión a internet.";
  }

  return "Ocurrió un error al cargar el panel de control. Inténtalo de nuevo. Si el problema persiste, contacta a la DEU.";
};

export const getGroupErrorMessage = (rawError: string): string => {
  if (!rawError) {
    return "Ocurrió un error inesperado con el grupo de extensión. Inténtalo de nuevo.";
  }

  const normalizedError = rawError.trim().toLowerCase();

  if (GROUP_ERRORS[normalizedError]) {
    return GROUP_ERRORS[normalizedError];
  }

  if (GLOBAL_ERRORS[normalizedError]) {
    return GLOBAL_ERRORS[normalizedError];
  }

  // Manejo de patrones dinámicos
  if (normalizedError.includes("invalid type:")) {
    return "El tipo de grupo de extensión seleccionado no es válido.";
  }

  if (normalizedError.includes("failed to generate provider code")) {
    return "Error al generar el código único del grupo. Inténtalo de nuevo.";
  }

  if (normalizedError.includes("failed to create group with requests")) {
    return "No se pudo procesar la solicitud del grupo. Verifica los datos ingresados.";
  }

  if (normalizedError.includes("failed to upload")) {
    return "Error al subir los archivos adjuntos. Verifica el formato y tamaño de los documentos.";
  }

  if (normalizedError.includes("documento del miembro #") && normalizedError.includes("es requerido")) {
    return rawError; // Conserva el mensaje amigable con el índice exacto formateado desde backend
  }

  if (normalizedError.includes("petición") || normalizedError.includes("failed to fetch")) {
    return "No se pudo conectar con el servidor backend. Verifica tu conexión a internet.";
  }

  return "Ocurrió un error al procesar el grupo de extensión. Inténtalo de nuevo. Si el problema persiste, contacta a la DEU.";
};

export const getGroupRequestErrorMessage = (rawError: string): string => {
  if (!rawError) {
    return "Ocurrió un error inesperado al procesar la solicitud del grupo. Inténtalo de nuevo.";
  }

  const normalizedError = rawError.trim().toLowerCase();

  if (GROUP_REQUEST_ERRORS[normalizedError]) {
    return GROUP_REQUEST_ERRORS[normalizedError];
  }

  if (GLOBAL_ERRORS[normalizedError]) {
    return GLOBAL_ERRORS[normalizedError];
  }

  // Manejo de patrones dinámicos
  if (normalizedError.includes("error sending credentials email")) {
    return "La solicitud fue aprobada, pero ocurrió un problema al enviar el correo electrónico con las credenciales de acceso. Contacta a soporte técnico.";
  }

  if (normalizedError.includes("petición") || normalizedError.includes("failed to fetch")) {
    return "No se pudo conectar con el servidor backend. Verifica tu conexión a internet.";
  }

  return "Ocurrió un error al procesar la solicitud del grupo. Inténtalo de nuevo. Si el problema persiste, contacta a la DEU.";
};

export const getResourceRequestErrorMessage = (rawError: string): string => {
  if (!rawError) {
    return "Ocurrió un error inesperado al procesar la solicitud de recurso. Inténtalo de nuevo.";
  }

  const normalizedError = rawError.trim().toLowerCase();

  if (RESOURCE_REQUEST_ERRORS[normalizedError]) {
    return RESOURCE_REQUEST_ERRORS[normalizedError];
  }

  if (GLOBAL_ERRORS[normalizedError]) {
    return GLOBAL_ERRORS[normalizedError];
  }

  if (normalizedError.includes("petición") || normalizedError.includes("failed to fetch")) {
    return "No se pudo conectar con el servidor backend. Verifica tu conexión a internet.";
  }

  return "Ocurrió un error al procesar la solicitud de recurso. Inténtalo de nuevo. Si el problema persiste, contacta a la DEU.";
};
