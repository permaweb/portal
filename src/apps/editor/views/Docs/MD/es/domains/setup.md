# Configuración de Dominios

La configuración de dominios te permite conectar nombres de dominio personalizados a tu portal, brindándote una presencia web profesional mientras mantienes los beneficios del alojamiento descentralizado en la red Arweave.

#### Características principales

- **Dominios personalizados**: Usa tu propio nombre de dominio
- **Alojamiento descentralizado**: Mantén las ventajas de la descentralización
- **Marca profesional**: Crea una dirección web memorable
- **Integración DNS**: Conecta dominios existentes a tu portal

#### Tipos de acceso

**Acceso nativo de Arweave:**
- **URLs permanentes**: Dirección Arweave inmutable
- **Gateways**: Accesible a través de gateways Arweave
- **Alojamiento permanente**: Contenido almacenado para siempre

**Ventajas de dominios personalizados:**
- **Reconocimiento de marca**: Apariencia profesional
- **URLs memorables**: Fáciles de compartir
- **SEO mejorado**: Mejor posicionamiento en buscadores

#### Proceso de configuración

**Requisitos previos:**
- Ser propietario del dominio
- Acceso a configuración DNS
- Portal completamente configurado

**Paso 1: Registro de dominio**
- Compra tu dominio en cualquier registrador
- Asegura acceso a configuración DNS
- Considera requisitos de certificado SSL

**Paso 2: Configuración en Portal**
1. Navega a **Dominios** en el menú
2. Selecciona **Añadir dominio personalizado**
3. Ingresa tu dominio completo (ej. `misitio.com`)
4. Completa el proceso de verificación

#### Configuración DNS

**Registros necesarios:**

**Registro CNAME:**

```
Nombre: www (o subdominio)
Tipo: CNAME
Valor: [Tu dirección de gateway Arweave]
TTL: 300
```

**Registro A (alternativa):**

```
Nombre: @ (para dominio raíz)
Tipo: A
Valor: [IP del gateway]
TTL: 300
```


**Ejemplos por proveedor:**

**Cloudflare:**
1. Accede al panel
2. Selecciona tu dominio
3. Ve a configuración DNS
4. Añade los registros

**Namecheap:**
1. Administración de dominio
2. DNS Avanzado
3. Añade nuevo registro

#### Seguridad SSL

**Configuración:**
- SSL automático con muchos proveedores
- Certificados Let's Encrypt gratuitos
- Opción de cargar certificados propios

**Consideraciones:**
- Forzar HTTPS en todo el tráfico
- Mantener beneficios de seguridad de Arweave
- Verificación periódica de propiedad

#### Verificación y pruebas

**Proceso:**
- Espera 24-48 horas para propagación DNS
- Usa herramientas de verificación integradas
- Monitorea estado de conexión

**Pruebas recomendadas:**
- Acceso directo en múltiples navegadores
- Compatibilidad en móviles
- Verificación de enlaces internos
- Pruebas de rendimiento

#### Gestión avanzada

**Dominio principal:**
- Establece tu dirección principal
- Configura redirecciones
- Estructura de URLs canónicas

**Subdominios:**
- `blog.tudominio.com` para contenido
- `portal.tudominio.com` para el portal completo
- Subdominios temáticos según necesidad

#### Solución de problemas

**Problemas comunes:**
- **DNS no propagado**: Espera 48 horas máximo
- **Certificados SSL**: Verifica fechas de expiración
- **Portal no carga**: Revisa precisión de registros

**Herramientas útiles:**
- Limpiar caché DNS local
- Verificadores de propagación en línea
- Soporte técnico de tu proveedor DNS

#### Buenas prácticas

**Selección de dominio:**
- Coherente con tu marca
- Simple y memorable
- Extensión adecuada (.com, .org, etc.)

**Mantenimiento:**
- Monitoreo regular de registros DNS
- Renovación oportuna de certificados
- Copias de seguridad de configuración
- Auditorías de seguridad periódicas

**Rendimiento:**
- Integración con CDN para mejor velocidad
- Optimización geográfica
- Estrategias de caché efectivas

**Costos a considerar:**
- Registro y renovación anual
- Protección de privacidad
- Servicios DNS premium
- Certificados SSL (si no son gratuitos)

Consejo profesional: Documenta toda tu configuración y realiza pruebas periódicas para garantizar el funcionamiento óptimo de tu dominio personalizado.