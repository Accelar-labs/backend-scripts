# Primeira Etapa: Construção (Builder)
FROM ubuntu:latest AS builder

# Instalar ferramentas necessárias, Node.js e Python
RUN apt-get update && \
    apt-get install -y curl make g++ python3 python3-pip && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get install -y build-essential curl --no-install-recommends

# Instalar Rust e configurar ambiente
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
ENV CARGO_HOME="/root/.cargo"
ENV RUSTUP_HOME="/root/.rustup"

# Instalar o target wasm32-unknown-unknown para Rust
RUN rustup target add wasm32-unknown-unknown

WORKDIR /app

# Instalação de dependências Node.js
COPY package*.json ./
RUN npm install

# Copia o projeto e constrói
COPY . .
RUN npm run build

RUN find /app -type f -name "*.wasm"  # Isso listará todos os arquivos .wasm no diretório /app

# Instalação de dependências Python
# COPY requirements.txt ./
# RUN pip3 install --no-cache-dir -r requirements.txt

# Instalação do Soroban CLI - se    uiser a masi autalizada sem ser o preivew, so tirar o --version
RUN cargo install soroban-cli --version 21.0.0-preview.1 && ls /root/.cargo/bin

# Copia os arquivos .wasm necessários
# COPY ./src/blockchain/soroban/soroban-deployer/target/wasm32-unknown-unknown/release/*.wasm /app/wasm/

# Segunda Etapa: Imagem Final
FROM ubuntu:latest

WORKDIR /app

# Instalar Node.js e Python
RUN apt-get update && \
    apt-get install -y curl make g++ python3 python3-pip && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Define environment variable to skip prompts
ENV DFXVM_INIT_YES=true \
    DFX_VERSION=0.16.1
# Instala dfx
RUN curl -fsSL https://internetcomputer.org/install.sh | sh

# Copia os artefatos da construção e os no de_modules  para a imagem final
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/*.wasm ./
# COPY --from=builder /app/blockchain/soroban/soroban-deployer/target ./dist

# Copia o Rust, Cargo e Soroban CLI
COPY --from=builder /root/.cargo /root/.cargo
COPY --from=builder /root/.rustup /root/.rustup
COPY --from=builder /root/.cargo/bin/soroban /usr/local/bin/soroban

# Configura variáveis de ambiente
ENV PATH="/root/.cargo/bin:/usr/local/bin:${PATH}"
ENV CARGO_HOME="/root/.cargo"
ENV RUSTUP_HOME="/root/.rustup"

# Adicionar a rede testnet e mainnet ao Soroban CLI
RUN soroban network add --global testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015"

ARG SOROBAN_RPC_MAINNET
ENV SOROBAN_RPC_MAINNET ${SOROBAN_RPC_MAINNET}
RUN soroban network add --global mainnet --rpc-url ${SOROBAN_RPC_MAINNET} --network-passphrase "Public Global Stellar Network ; September 2015"

# Copia as dependências Python instaladas  (note que isso pode não ser necessário ou ideal, dependendo de como você usa Python)
# É preferível reinstalar as dependências Python na imagem final para garantir que tudo esteja corretamente configurado
# COPY --from=builder /app/requirements.txt ./
# RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]