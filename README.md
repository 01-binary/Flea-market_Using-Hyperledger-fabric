# Blockchain Web Application
# 프로젝트 명 : 블록체인을 활용한 중고거래 이력 관리 시스템 구성
- 유니포인트 협업
# 진행 시기 : 19.03.03 – 05.28 
# 프로젝트 설명 : 블록체인을 활용하여, 해당 사이트 고객이 해당 사이트 외 다른 사이트의 판매자에 대한 기록까지 조회 가능
<img width="445" alt="Dna24_1" src="https://user-images.githubusercontent.com/15652602/63577169-ca51cb80-c5c8-11e9-9fec-af0f11e81e22.png">
<img width="408" alt="dna2" src="https://user-images.githubusercontent.com/15652602/63577165-c9b93500-c5c8-11e9-9488-9f89b468bf32.png">
<img width="333" alt="dna3" src="https://user-images.githubusercontent.com/15652602/63577167-c9b93500-c5c8-11e9-9ab8-c41212f9aa3d.png">
<img width="408" alt="dna4" src="https://user-images.githubusercontent.com/15652602/63577359-2caacc00-c5c9-11e9-9a11-f791a218a3ad.png">
위 사진에서 판매자의 정보는 블록체인 Hyperledger Fabric에서 query한 결과입니다.
판매자의 주민등록번호 Hash 값을 통해 Query, invoke 등이 가능하며, invoke된 정보를 삭제되지 않으므로 위와 같이 판매자의 정보를 영구적으로 기록 가능합니다.


# Before start!

>#### <i class="icon-file"><> CentOS setting for Hyperledger Fabric
> 
> sudo dhclient  
> sudo yum install wget  
> sudo yum install git  
> sudo yum group install "Development Tools"  
> sudo yum install libtool-ltdl-devel  
>  
> ' GO 언어 설치 '  
> wget https://dl.google.com/go/go1.12.1.linux-amd64.tar.gz  # 버전 확인 -> https://golang.org/dl/  
> tar xvzf go1.12.1.linux-amd64.tar.gz  
>  
> ' 환경변수 설정 '  
> sudo vi .bashrc  
> export GOROOT=/home/`username`/go # superuser로 Blochain system을 실행할 수도 있기 때문에 절대경로로 잡아줌  
> export GOPATH=/home/`username`/go  
> export PATH=$PATH:$GOROOT/bin:$GOPATH/bin  
>  
> source .bashrc  
> go version  
>  
> ' nvm 설치 '  
> wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash  # 버전 확인 -> https://github.com/creationix/nvm#install-script  
> source .bash_profile  
> 
> ' Node.js 설치 '  
> nvm install v9.4.0  
> nvm use v9.4.0  
> source .bash_profile  
> 
> ' docker 설치 '  
> curl -fsSL get.docker.com -o get-docker.sh  
> sudo sh get-docker.sh  
> sudo usermod -aG docker [계정명]  # sudo 명령 없이 docker 명령이 가능하도록, 재로그인 후에 적용됨  
> sudo systemctl start docker.service  
>  
> ' docker compose 설치 '  
> sudo curl -L https://github.com/docker/compose/releases/download/1.22.0-rc2/docker-compose-`uname -s\`-\`uname -m` -o /usr/local/bin/docker-compose  # 버전 확인 -> https://github.com/docker/compose/releases  
> sudo chmod +x /usr/local/bin/docker-compose  
> docker-compose --version  
>  
> ' Hyperledger Fabric Sample 다운로드 '  
> git clone -b master https://github.com/hyperledger/fabric-samples.git  
> cd fabric-samples  
>  
> ' docker image 다운로드 '  
> curl -sSL http://bit.ly/2ysbOFE | bash -s 1.2.1  
> cd  
> sudo vi .bashrc  
> export PATH=/home/`username`/fabric-samples/bin:$PATH  
>  
> source .bashrc  
> docker images  
  
  
>#### <i class="icon-file"><> npm package  
>  
> npm init  
> npm install express --save  
> npm install body-parser --save  
> npm install multer --save  
> npm install jsonwebtoken --save  
> npm install ejs --save  
> npm install express-ejs-layouts --save  
> npm install supervisor -g  
>  
> node app.js  
> or supervisor app.js  


