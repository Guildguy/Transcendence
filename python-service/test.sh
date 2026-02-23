#!/bin/bash
set -e

echo "=== Teste isolado do Python Profile Service ==="
echo ""

echo "subindo network"
docker network inspect test-net >/dev/null 2>&1 || \
docker network create test-net
echo ""

# 1. Sobe MongoDB isolado
echo "1️⃣  Subindo MongoDB..."
docker run -d \
	--name test-mongo  \
	--network test-net \
	-p 27017:27017 \
	mongo:7
sleep 3

# 2. Importa dados de teste
echo "2️⃣  Importando dados de teste..."
docker exec -i test-mongo mongoimport \
  --db transcendence \
  --collection profiles \
  --jsonArray < test-data.json

echo "   Dados importados!"

# 3. Builda e roda o Python service
echo "3️⃣  Buildando Python service..."
docker build -t test-python-service .

echo "4️⃣  Rodando Python service..."
docker run -d \
	--name test-python \
	--network test-net \
  	-p 8000:8000 \
  	-e MONGO_URL=mongodb://test-mongo:27017 \
  	-e DB_NAME=transcendence \
  	test-python-service
sleep 2

# 4. Testa endpoints
echo ""
echo "=== Testando endpoints ==="
echo ""

echo " GET / (status):"
curl -s http://localhost:8000/ && echo ""
echo "Ta funfando aqui, o serviço subiu!!"
echo ""

echo " GET /health:"
curl -s http://localhost:8000/health && echo ""
echo ""

echo " GET /profile/1 (John Doe):"
curl -s http://localhost:8000/profile/1 && echo ""
echo ""

echo " GET /profile/2 (Jane Smith):"
curl -s http://localhost:8000/profile/2 && echo ""
echo ""

echo " GET /profile/999 (não existe - deve dar 404):"
curl -s http://localhost:8000/profile/999 && echo ""
echo ""

echo "=== Logs do serviço ==="
docker logs test-python
echo ""

echo "=== Limpeza ==="
echo "Para remover os containers de teste, rode:"
echo "  docker stop test-mongo test-python && docker rm test-mongo test-python"


