# Resultados de pruebas de la sección 4

Fecha de ejecución: 7 de septiembre de 2026
Aplicación: `http://localhost:5173`
API: `http://localhost:8080`

## Resumen

| Resultado | Cantidad |
|---|---:|
| Aprobado | 46 |
| Fallido | 1 |
| No ejecutable por falta de datos de prueba | 5 |
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
| CP-016 | Aprobado | El listado inicial presenta hostname, ubicación, estado, clúster y porcentajes de CPU y RAM para 11 servidores. |
| CP-017 | Aprobado | Los nombres de los activos abren sus fichas; también se verificó `srv-blade01` desde el chasis hacia `/inventario/servidores/blade/3`. |
| CP-018 | Aprobado | El listado de 5 unidades de storage muestra hostname, ubicación, estado, clúster/proyecto, capacidad usada y protocolo. |
| CP-019 | Aprobado | El listado de switches muestra hostname, ubicación, estado, tipo, velocidad, IP y puertos utilizados sobre el total, por ejemplo `20/28`. |
| CP-020 | Aprobado | Se probaron filtros individuales y combinados; por ejemplo Lima + Analytics + HPE redujo el listado a un único servidor válido. |
| CP-021 | Aprobado | Una combinación sin coincidencias mostró `0 de 10` y el mensaje de que no se encontraron equipos, sin error. |
| CP-022 | Aprobado | Buscar `srv-blade01` mostró únicamente el activo correspondiente. |
| CP-023 | Aprobado | Buscar `activo-inexistente-xyz` mostró cero resultados y un mensaje explicativo. |
| CP-024 | Aprobado | Se generó correctamente `inventario-servidores (3).xlsx`, de 16 421 bytes, con el activo seleccionado. |
| CP-025 | Aprobado | Con cero resultados se muestra `No hay datos para exportar.` y el botón permanece deshabilitado, sin generar un Excel vacío. |
| CP-026 | Aprobado | Se generó correctamente `inventario-servidores (4).csv`, de 148 bytes, con el activo seleccionado. |
| CP-027 | Aprobado | Con cero resultados se muestra `No hay datos para exportar.` y el botón permanece deshabilitado, sin generar un CSV vacío. |
| CP-028 | Aprobado | `GET /api/servidores` respondió 200 con JSON válido. |
| CP-029 | Aprobado | Un ID inexistente respondió 404, un parámetro mal formado respondió 400 y un endpoint inexistente respondió 404; las respuestas fueron controladas y no incluyeron `trace`. |
| CP-030 | Aprobado | `srv-incompleto01` abre su ficha sin error y deja Generación vacía cuando el dato no está registrado. |
| CP-031 | Aprobado | Las fichas incompletas de servidor, storage y switch muestran la tabla de CPU con `No hay componentes registrados.` sin bloquear el resto del detalle. |
| CP-032 | Aprobado | Las fichas incompletas de servidor, storage y switch muestran la tabla de RAM con `No hay componentes registrados.` sin bloquear el resto del detalle. |
| CP-033 | Aprobado | `srv-incompleto01` y `stg-incompleto01` muestran la tabla de discos vacía con un mensaje explicativo y sin errores. |
| CP-034 | Aprobado | `srv-incompleto01` abre normalmente y presenta vacíos los datos no registrados del sistema operativo. |
| CP-035 | Aprobado | Servidor, storage, switch y chasis incompletos muestran la tabla de ventiladores con `No hay componentes registrados.` sin bloquear la ficha. |
| CP-036 | Aprobado | Servidor, storage y chasis incompletos muestran la tabla de red con `No hay componentes registrados.` sin bloquear la ficha. |
| CP-037 | Aprobado | Servidor, storage, switch y chasis incompletos muestran la tabla de fuentes de poder con `No hay componentes registrados.` sin bloquear la ficha. |
| CP-038 | Aprobado | Servidor, storage, switch y chasis incompletos muestran temperatura y consumo eléctrico como `N/D` sin bloquear la ficha. |
| CP-039 | Aprobado | `stg-incompleto01` muestra Controladoras RAID con `No hay componentes registrados.` y carga el resto de la ficha. |
| CP-040 | Aprobado | `sw-incompleto01` muestra el estado general como `N/D` y conserva correctamente los estados Encendido y Apagado de sus puertos. |
| CP-041 | Aprobado | Los activos incompletos muestran responsable y dejan vacíos orden de compra, EOL y EOS sin producir errores. |
| CP-042 | Aprobado | Los activos incompletos cargan sus fichas y dejan vacíos versión de firmware y última actualización sin producir errores. |
| CP-043 | No ejecutable | El ambiente contiene 11 servidores y no ofrece una condición de inventario de servidores vacío. |
| CP-044 | No ejecutable | El ambiente contiene 23 activos y no ofrece una condición de inventario completamente vacío. |
| CP-045 | Aprobado | La ficha de `srv-incompleto01` abre sin bloquearse y muestra `N/A` en los campos generales faltantes; sus porcentajes de RAM y CPU también aparecen como `N/A` en el listado. |
| CP-046 | Aprobado | `chs-vacio01` abre normalmente y muestra sus cuatro slots como Libres y Sin servidor, sin datos inconsistentes. |
| CP-047 | No ejecutable | El ambiente contiene 5 unidades de storage. |
| CP-048 | No ejecutable | El ambiente contiene 5 switches. |
| CP-049 | Aprobado | Las controladoras RAID se muestran con modelo, RAID, serie y estado en servidor `9` y storage `16`. |
| CP-050 | Aprobado | En `srv-app01`, sin controladoras RAID, la tabla muestra un mensaje de componentes no registrados y el resto de la ficha carga normalmente. |
| CP-051 | Aprobado | El listado muestra hostname, clúster, ubicación, modelo, IP de gestión y estado; `chs-vacio01` presenta su IP faltante como `N/A`. |
| CP-052 | No ejecutable | El ambiente contiene 2 chasis blade y no ofrece una condición de inventario de chasis vacío. |

## Defectos encontrados

1. Las tarjetas de red no muestran el tipo de conexión.

## Datos de prueba faltantes

Para ejecutar los 5 casos pendientes se requiere un ambiente controlado con inventarios vacíos de servidores, storage, switches, chasis y de todos los activos en conjunto.
