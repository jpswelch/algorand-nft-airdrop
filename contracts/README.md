# Setup

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install [Algorand sandbox](https://github.com/algorand/sandbox)
3. Add this project folder as bind volume in sandbox `docker-compose.yml` under key `services.algod`:
   ```yml
   volumes:
     - type: bind
       source: <path>
       target: /data
   ```
4. Start sandbox:
   ```txt
   $ ./sandbox up
   ```
5. Install Python virtual environment in project folder:
   ```txt
   $ python3 -m venv venv
   $ source ./venv/Scripts/activate # Windows
   $ source ./venv/bin/activate # Linux
   $ pip3 install -r requirements.txt
   ```
