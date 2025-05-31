#!/usr/bin/env bash
# manage_ssl.sh — Automatización de SSL para creator0x.com y dominios propios
#
# Uso:
#   sudo ./manage_ssl.sh install-deps                     # Instala Certbot + plugin
#   sudo ./manage_ssl.sh init-namecheap USER API_KEY IP   # Guarda credenciales Namecheap e IP whitelisteada
#   sudo ./manage_ssl.sh wildcard                         # Emite wildcard *.creator0x.com
#   sudo ./manage_ssl.sh custom mydomain.com              # Emite cert + vhost para dominio propio
#   sudo ./manage_ssl.sh remove mydomain.com              # Elimina cert y vhost del dominio
#   sudo ./manage_ssl.sh renew                            # Renueva todos los certificados
#
# Explicación detallada:
#   1. Wildcard (*.creator0x.com): con un solo certificado cubrimos todos los
#      subdominios dinámicos username.creator0x.com. Se valida vía DNS-01 usando
#      la API de Namecheap, por lo que sólo se emite una vez y se renueva
#      automáticamente.
#   2. Dominios personalizados: cuando un cliente apunta su dominio a nuestro
#      VPS, emitimos un certificado HTTP-01 con el flag --nginx. Esto funciona
#      porque el desafío se sirve directamente desde Nginx.
#   3. Renovación: `certbot renew` se encarga de renovar tanto el wildcard como
#      los dominios propios. El hook recarga Nginx para que cargue los nuevos
#      certificados.
#
# Añade un cron para renovar cada día:
#   echo "0 3 * * * root /usr/bin/sudo /ruta/complete/manage_ssl.sh renew" | sudo tee /etc/cron.d/ssl_renew
#
set -euo pipefail

EMAIL="admin@creator0x.com"        # Email de contacto para Let's Encrypt
DOMAIN="creator0x.com"            # Dominio base
NAMECHEAP_INI="/etc/letsencrypt/namecheap.ini"
LANDING_PORT=3000                 # Puerto del backend de landings

install_deps() {
  apt update -y
  # Instala pip si aún no está
  if ! command -v pip3 >/dev/null 2>&1; then
    apt install -y python3-pip
  fi

  # Instala Certbot y el plugin DNS de Namecheap
  apt install -y certbot
  pip3 install --upgrade certbot-dns-namecheap
  echo "✅ Dependencias instaladas"
}

init_namecheap() {
  local user="$1" key="$2" ip="$3"
  cat > "$NAMECHEAP_INI" <<EOF
dns_namecheap_username = $user
dns_namecheap_api_key   = $key
dns_namecheap_client_ip = $ip
EOF
  chmod 600 "$NAMECHEAP_INI"
  echo "✅ Credenciales Namecheap guardadas con client_ip=$ip"
}

issue_wildcard() {
  # Validaciones previas
  if ! python3 -m pip show certbot-dns-namecheap >/dev/null 2>&1; then
    echo "❌ Falta el plugin certbot-dns-namecheap. Ejecuta '$0 install-deps' primero."; exit 1; fi

  if [ ! -f "$NAMECHEAP_INI" ]; then
    echo "❌ Falta el archivo $NAMECHEAP_INI. Ejecuta '$0 init-namecheap <user> <api_key> <ip>' primero."; exit 1; fi

  certbot certonly \
    --dns-namecheap \
    --dns-namecheap-credentials "$NAMECHEAP_INI" \
    --cert-name "$DOMAIN" \
    -d "$DOMAIN" -d "*.$DOMAIN" \
    --agree-tos --non-interactive --email "$EMAIL"
  systemctl reload nginx
  echo "✅ Wildcard *.$DOMAIN emitido y Nginx recargado"
}

issue_custom() {
  local dom="$1"
  # Borra blackhole si existe
  rm -f "/etc/nginx/sites-enabled/${dom}_gone.conf" "/etc/nginx/sites-available/${dom}_gone.conf"

  certbot certonly --nginx -d "$dom" -d "www.$dom" \
    --agree-tos --non-interactive --email "$EMAIL"

  # Configura el vhost con el nuevo certificado
  create_vhost "$dom"

  echo "✅ Certificado y vhost configurados para $dom"
}

create_vhost() {
  local dom="$1"
  local conf="/etc/nginx/sites-available/${dom}.conf"

  # Si ya existe, solo aseguramos que esté habilitado
  if [ ! -f "$conf" ]; then
cat > "$conf" <<EOF
# Generado automáticamente por manage_ssl.sh
server {
    listen 80;
    server_name ${dom} www.${dom};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${dom} www.${dom};

    ssl_certificate     /etc/letsencrypt/live/${dom}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${dom}/privkey.pem;

    location / {
        proxy_pass http://localhost:${LANDING_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF
  fi

  ln -sf "$conf" /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
  echo "✅ Vhost Nginx para $dom configurado y Nginx recargado"
}

remove_domain() {
  local dom="$1"
  local conf="/etc/nginx/sites-available/${dom}.conf"

  # 1. Eliminar vhost y enlace habilitado
  rm -f "$conf" "/etc/nginx/sites-enabled/${dom}.conf"

  # 2. Borrar certificado (ignorar error si no existe)
  certbot delete --cert-name "$dom" --non-interactive --quiet || true

  # 3. Crear vhost "blackhole" que responde 410 (Gone) para evitar redirecciones
  local bh_conf="/etc/nginx/sites-available/${dom}_gone.conf"
cat > "$bh_conf" <<EOF
server {
    listen 80;
    server_name ${dom} www.${dom};
    return 410;  # Gone
}

server {
    listen 443 ssl;
    server_name ${dom} www.${dom};

    # Certificado fallback (snake-oil si existe, sino wildcard)
    ssl_certificate     $( [ -f /etc/ssl/certs/ssl-cert-snakeoil.pem ] && echo "/etc/ssl/certs/ssl-cert-snakeoil.pem" || echo "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" );
    ssl_certificate_key $( [ -f /etc/ssl/private/ssl-cert-snakeoil.key ] && echo "/etc/ssl/private/ssl-cert-snakeoil.key" || echo "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" );

    return 410;
}
EOF

  ln -sf "$bh_conf" /etc/nginx/sites-enabled/

  # 4. Recargar Nginx para aplicar cambios
  nginx -t && systemctl reload nginx

  echo "✅ Dominio $dom dado de baja: certificado eliminado y responde 410"
}

renew_all() {
  certbot renew --post-hook "systemctl reload nginx"
  echo "✅ Renovación completada y Nginx recargado"
}

case "${1:-}" in
  install-deps)   install_deps ;;
  init-namecheap) init_namecheap "${2:-}" "${3:-}" "${4:-}" ;;
  wildcard)       issue_wildcard ;;
  custom)         issue_custom "${2:-}" ;;
  remove)         remove_domain "${2:-}" ;;
  renew)          renew_all ;;
  *)
    echo "Uso: $0 {install-deps|init-namecheap|wildcard|custom|remove|renew}"
    exit 1 ;;
esac
