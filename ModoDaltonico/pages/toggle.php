<?php

require_api( 'authentication_api.php' );
require_api( 'form_api.php' );

auth_ensure_user_authenticated();
form_security_validate( 'plugin_ModoDaltonico_toggle' );

$f_active = gpc_get_string( 'active', '' );

$t_valid_values = array( 'on', 'off' );
$t_ok = in_array( $f_active, $t_valid_values );

form_security_purge( 'plugin_ModoDaltonico_toggle' );

header( 'Content-Type: application/json; charset=utf-8' );
echo json_encode( array( 'ok' => $t_ok ) );
