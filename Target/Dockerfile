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
    openssh-server

# SSHサーバーが動くために絶対に必要なディレクトリを作成
RUN mkdir -p /run/sshd

# rootパスワードを「rootpassword」に設定
RUN echo 'root:rootpassword' | chpasswd

# 外部からのrootログインを許可するように設定ファイルを書き換え
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

RUN mkdir home/ubuntu/.ssh
# RUN touch home/ubuntu/.ssh/authorized_keys
COPY id_ed25519.pub /home/ubuntu/.ssh/authorized_keys


# 権限と所有者の設定
RUN chmod 700 /home/ubuntu/.ssh && \
    chmod 600 /home/ubuntu/.ssh/authorized_keys && \
    chown -R ubuntu:ubuntu /home/ubuntu/.ssh



# ユーザ作成
#RUN useradd -m ubuntu 

EXPOSE 22

# コンテナのメインプロセスとしてSSHサーバーを起動し続ける
CMD ["/usr/sbin/sshd", "-D"]