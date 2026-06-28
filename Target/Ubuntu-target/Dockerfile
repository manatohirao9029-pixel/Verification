FROM ubuntu:24.04

# 必要なツールとSSHサーバーをまとめてインストール
RUN apt-get update && apt-get install -y \
    build-essential \
    vim \
    cmake \
    git \
    curl \
    wget \
    unzip \
    pkg-config \
    libssl-dev \
    libcurl4-openssl-dev \
    libjsoncpp-dev \
    openssh-server \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Pythonの環境のセットアップ
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Goの環境のセットアップ
RUN apt-get update && apt-get install -y \
    golang \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# SSHサーバーが動くために絶対に必要なディレクトリを作成
RUN mkdir -p /run/sshd

# SSH周りのセットアップ
# 【修正】先頭に / を追加しました
RUN mkdir -p /home/ubuntu/.ssh
COPY id_ed25519.pub /home/ubuntu/.ssh/authorized_keys

# 権限と所有者の設定
RUN chmod 700 /home/ubuntu/.ssh && \
    chmod 600 /home/ubuntu/.ssh/authorized_keys && \
    chown -R ubuntu:ubuntu /home/ubuntu/.ssh

RUN usermod -aG sudo ubuntu && \
    echo "ubuntu ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

EXPOSE 22
EXPOSE 8080
EXPOSE 443
EXPOSE 5173
EXPOSE 9100

# 【追加】SSHサーバーをフォアグラウンドで起動し続ける設定
CMD ["/usr/sbin/sshd", "-D"]