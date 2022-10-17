react: save

	REACH_DOCKER=0 REACH_CONNECTOR_MODE=ALGO-live ./reach react

save: restore
	mv index.mjs bak

restore:
	[ ! -f bak ] || mv bak index.mjs
