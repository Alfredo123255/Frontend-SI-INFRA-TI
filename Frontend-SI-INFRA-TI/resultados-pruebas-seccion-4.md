# Resultados de pruebas de la sección 4

Fecha de ejecución: 6 de septiembre de 2026  
Aplicación: `http://localhost:5173`  
API: `http://localhost:8080`

## Resumen

| Resultado | Cantidad |
|---|---:|
| Aprobado | 30 |
| Fallido | 3 |
| No ejecutable por falta de datos de prueba | 19 |
| Total | 52 |

Los casos se ejecutaron sobre los datos disponibles en el ambiente local. Los casos marcados como no ejecutables requieren una precondición que no existe actualmente, como inventarios vacíos o activos con campos específicos sin registrar. No se modificaron datos del backend para fabricar esas condiciones.

## Resultados por caso

| Caso | Resultado | Evidencia u observación |
|---|---|---|
| CP-001 | Aprobado | La ficha de `srv-web01` muestra serie, fabricante, modelo, hostname, ubicación, generación e IP de gestión y del sistema operativo. |
| CP-002 | Aprobado | CPU verificada en servidor `9`, storage `16` y switch `18`, con los campos definidos en la matriz. |
| CP-003 | Aprobado | RAM verificada en servidor `9`, storage `16` y switch `18`, incluyendo marca, modelo, velocidad, generación, capacidad y estado. |
| CP-004 | Aprobado | Discos verificados en servidor `9` y storage `16`, incluyendo marca, modelo, velocidad, capacidad, tipo y estado. |
| CP-005 | Aprobado | La ficha del servidor muestra versión y fecha de soporte del sistema operativo. |
| CP-006 | Aprobado | Las tablas de ventiladores muestran velocidad, modelo y estado en servidor, switch, storage y chasis. |
| CP-007 | Fallido | Las tarjetas y sus puertos se muestran, pero falta el tipo de conexión de la tarjeta de red. |
| CP-008 | Aprobado | Fuentes de poder verificadas en servidor, storage, switch y chasis con modelo, consumo, corriente y estado. |
| CP-009 | Aprobado | La ficha de `srv-web01` muestra temperatura y consumo eléctrico. |
| CP-010 | Aprobado | La ficha de `stg-san02` carga almacenamiento, CPU, RAM, protocolo, red, IOPS, caché de CPU, RAID, estado, ventiladores y fuentes. |
| CP-011 | Aprobado | La ficha de `sw-dist01` muestra cantidad de puertos, ocupados y libres, velocidad, modo, estados, CPU, RAM, fuentes y ventiladores. |
| CP-012 | Aprobado | Responsable, orden de compra, EOL y EOS aparecen en las fichas verificadas. |
| CP-013 | Aprobado | Versión de firmware y última actualización aparecen en las fichas verificadas. |
| CP-014 | Aprobado | Los inventarios muestran los activos en tablas con encabezados y filas. |
| CP-015 | Aprobado | El chasis `8` muestra el blade instalado, datos generales, slots, red y puertos, fuentes, ventiladores y firmware. |
| CP-016 | Aprobado | El listado inicial presenta hostname, ubicación, estado, clúster y porcentajes de CPU y RAM para 10 servidores. |
| CP-017 | Aprobado | Los nombres de los activos abren sus fichas; también se verificó `srv-blade01` desde el chasis hacia `/inventario/servidores/blade/3`. |
| CP-018 | Aprobado | El listado de 4 unidades de storage muestra hostname, ubicación, estado, clúster/proyecto, capacidad usada y protocolo. |
| CP-019 | Aprobado | El listado de switches muestra hostname, ubicación, estado, tipo, velocidad, IP y puertos utilizados sobre el total, por ejemplo `20/28`. |
| CP-020 | Aprobado | Se probaron filtros individuales y combinados; por ejemplo Lima + Analytics + HPE redujo el listado a un único servidor válido. |
| CP-021 | Aprobado | Una combinación sin coincidencias mostró `0 de 10` y el mensaje de que no se encontraron equipos, sin error. |
| CP-022 | Aprobado | Buscar `srv-blade01` mostró únicamente el activo correspondiente. |
| CP-023 | Aprobado | Buscar `activo-inexistente-xyz` mostró cero resultados y un mensaje explicativo. |
| CP-024 | Aprobado | Se generó correctamente `inventario-servidores (1).xlsx`, de 19 469 bytes. |
| CP-025 | Aprobado | Con cero resultados se muestra `No hay datos para exportar.` y el botón permanece deshabilitado, sin generar un Excel vacío. |
| CP-026 | Aprobado | Se generó correctamente `inventario-servidores.csv`, de 1 016 bytes. |
| CP-027 | Aprobado | Con cero resultados se muestra `No hay datos para exportar.` y el botón permanece deshabilitado, sin generar un CSV vacío. |
| CP-028 | Aprobado | `GET /api/servidores` respondió 200 con JSON válido. |
| CP-029 | Fallido | Los errores exponen la propiedad `trace`; un ID inexistente respondió 500 y un parámetro mal formado respondió 400 con traza interna. |
| CP-030 | No ejecutable | Los 10 servidores disponibles tienen generación registrada. |
| CP-031 | No ejecutable | Todos los servidores, storages y switches disponibles tienen CPU cargada. |
| CP-032 | No ejecutable | Todos los servidores, storages y switches disponibles tienen RAM cargada. |
| CP-033 | No ejecutable | Todos los servidores y storages disponibles tienen discos cargados. |
| CP-034 | No ejecutable | Todos los servidores disponibles tienen datos de sistema operativo. |
| CP-035 | No ejecutable | Se verificó el comportamiento vacío en `stg-nas01` y `sw-acc01`, pero no existen fixtures equivalentes para servidor y chasis, necesarios para completar el caso. |
| CP-036 | No ejecutable | Todos los servidores, storages y el chasis disponibles tienen tarjetas de red cargadas. |
| CP-037 | No ejecutable | Se verificó el comportamiento vacío en storages y `sw-acc01`, pero no existen fixtures equivalentes para servidor y chasis, necesarios para completar el caso. |
| CP-038 | Aprobado | El detalle de `srv-blade01` incluye la sección Energía y muestra temperatura y consumo eléctrico como `N/D` cuando no existen lecturas. |
| CP-039 | No ejecutable | Todas las unidades de storage disponibles tienen controladoras RAID cargadas. |
| CP-040 | No ejecutable | Todos los switches disponibles tienen estado operativo registrado. |
| CP-041 | No ejecutable | No existe un activo sin orden de compra, EOL y EOS. |
| CP-042 | No ejecutable | No existe un activo sin versión de firmware. |
| CP-043 | No ejecutable | El ambiente contiene 10 servidores y no ofrece una condición de inventario de servidores vacío. |
| CP-044 | No ejecutable | El ambiente contiene 19 activos y no ofrece una condición de inventario completamente vacío. |
| CP-045 | No ejecutable | No existe una ficha de activo con la mayoría de campos sin cargar. |
| CP-046 | No ejecutable | El único chasis disponible tiene un servidor blade instalado. |
| CP-047 | No ejecutable | El ambiente contiene 4 unidades de storage. |
| CP-048 | No ejecutable | El ambiente contiene 4 switches. |
| CP-049 | Aprobado | Las controladoras RAID se muestran con modelo, RAID, serie y estado en servidor `9` y storage `16`. |
| CP-050 | Aprobado | En `srv-app01`, sin controladoras RAID, la tabla muestra un mensaje de componentes no registrados y el resto de la ficha carga normalmente. |
| CP-051 | Fallido | El listado incluye las columnas exigidas, pero el único chasis (`chs-blade01`) no muestra clúster porque el endpoint devuelve `cluster: null`. |
| CP-052 | No ejecutable | El ambiente contiene un chasis blade y no ofrece una condición de inventario de chasis vacío. |

## Defectos encontrados

1. Las tarjetas de red no muestran el tipo de conexión.
2. Las respuestas de error de la API exponen trazas internas y los identificadores numéricos inexistentes responden 500.
3. El único chasis no muestra un clúster en el listado porque la API devuelve ese campo en `null`.

## Datos de prueba faltantes

Para ejecutar los 19 casos pendientes se requiere un ambiente controlado con activos que omitan deliberadamente CPU, RAM, discos, red, generación, SO, datos administrativos, firmware o estado, además de inventarios vacíos y un chasis sin blades.
