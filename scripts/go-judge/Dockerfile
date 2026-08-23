FROM criyle/go-judge:latest AS go-judge 
FROM debian:latest

# install compilers
# RUN apt ...
RUN apt update && apt install -y python3 gcc build-essential binutils && rm -rf /var/lib/apt/lists/*

WORKDIR /opt
COPY --from=go-judge /opt/go-judge /opt/mount.yaml /opt/
EXPOSE 5050/tcp 5051/tcp 5052/tcp
ENTRYPOINT ["./go-judge"]