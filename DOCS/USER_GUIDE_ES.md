# Guia de usuario Arcive (ES)

## Instalacion

1. Instala Node.js 20+ y dependencias: 
pm install
2. Ejecuta la app de escritorio: 
pm run tauri:dev
3. Para un instalador: 
pm run tauri:build

## Primera apertura

- Elige idioma (FR / EN / ES) arriba a la derecha.
- Pulsa **?** para la ayuda integrada.
- La barra de estado muestra la accion actual.

## Crear una caja fuerte

1. En **Caja fuerte**: elige una carpeta vacia o nueva.
2. Introduce una contrasena fuerte.
3. Pulsa **Inicializar la caja fuerte**.

## Contrasena y sesion

- La contrasena desbloquea la caja en cada accion.
- **Sesion**: bloqueo automatico (1-180 min). Tras inactividad se borra la contrasena.
- **Seguridad de la caja**: rotar contrasena (actual + nueva).

## Importar un documento

1. Abre una caja (ruta + contrasena).
2. En **Importar**: archivo + etiquetas CSV opcionales (ej. impuestos,2026).
3. Pulsa **Importar documento**.

## Buscar y listar

- **Listar documentos**: muestra toda la caja.
- **Buscar**: nombres, etiquetas y contenido indexado.
- Haz clic en un resultado para rellenar el ID.

## Exportar y versiones

- **Anadir version**: ID + archivo + nota opcional.
- **Exportar**: ID + ruta de salida (descifra el documento actual).

## Papelera

- **Eliminar**: envia a la papelera logica.
- **Restaurar**: recupera el documento.
- **Vaciar papelera**: borrado definitivo.

## Copia ZIP y restauracion

- **Crear copia ZIP**: archivo cifrado de la caja abierta.
- **Restaurar desde ZIP**: elige archivo, carpeta destino y contrasena.

## Diagnostico

- **Analizar salud de la caja**: blobs, versiones seguidas, huerfanos.

## Solucion de problemas

| Problema | Pista |
|----------|-------|
| Contrasena no valida | Comprueba la contrasena actual |
| Archivo no encontrado | Vuelve a seleccionar la ruta |
| Acceso denegado | Permisos de carpeta en Windows |
| Tauri no disponible | Ejecuta con 
pm run tauri:dev |

Ver tambien SECURITY.md y THREAT_MODEL.md.
