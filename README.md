## Plataforma de Espacialização dos Dados da Educação do Estado de Goiás

Esta plataforma tem o objetivo de espacializar via WebGIS (Sistemas de Informações Geográficas em ambiente web), os dados: do financiamento da educação, do Índice de Desenvolvimento da Educação Básica (IDEB), das matrículas da educação infantil e do transporte escolar em mapas georreferenciados. 

### Pré-requisitos

* [MySql]    - Executar script localizado em database/querys/banco_geral.sql
* [Node.js]  - Sugestão de Instalação descrita no próximo item. 

#### Instalação do Node.js via arquivo binário no linux

Crie o diretório do nodejs
```
# mkdir -p /usr/local/lib/nodejs
```

Descompacte o arquivo binário da última versão LTS disponível no diretório do nodejs criado anteriormente. /usr/local/lib/nodejs
```
# tar -xJvf node-v10.15.1-linux-x64.tar.xz -C /usr/local/lib/nodejs 
```

Adicione as variáveis de ambiente no arquivo ~/.bashrc

```
# nano ~/.bashrc
```
Copie as linhas abaixo para o final do arquivo ~/.bashrc

```
export VERSION=v10.15.1 
export DISTRO=linux-x64
export PATH=/usr/local/lib/nodejs/node-$VERSION-$DISTRO/bin:$PATH

alias node='/usr/local/lib/nodejs/node-$VERSION-$DISTRO/bin/node'
alias npm='/usr/local/lib/nodejs/node-$VERSION-$DISTRO/bin/npm'
alias npx='/usr/local/lib/nodejs/node-$VERSION-$DISTRO/bin/npx'
```
Recarrege o arquivo  
```
# source ~/.bashrc
```
Teste a instalação verificando as versões, conforme comandos abaixo
```
# node -v

# npm version

# npx -v
```
A saída normal seria:

```
# node -v
v8.11.4
```

```
# npm version


{ npm: '5.6.0',
 ares: '1.10.1-DEV',
 cldr: '31.0.1',
 http_parser: '2.7.0',
 icu: '59.1',
 modules: '57',
 nghttp2: '1.25.0',
 node: '8.11.4',
 openssl: '1.0.2n',
 tz: '2017b',
 unicode: '9.0',
 uv: '1.15.0',
 v8: '6.1.534.50',
 zlib: '1.2.11' }

```

### Deployment

1. Para iniciar o servidor você precisa acessar o diretório server/ e executar o comando abaixo no terminal

Ambiente de produção:
```
# nohup node main.js &
```
Ambiente de desenvolvimento:
```
# node main.js
```
OBS: A execução do node com o comando (nohup e & no final) faz com que a aplicação fique executando em background. 

2. Para acessar a aplicação digite o endereço abaixo no navegador: 

```
http://localhost
```

### Dependências

* [Node.js](https://nodejs.org/en/) - Servidor web 
* [Leaflet](https://leafletjs.com/) - Biblioteca JavaScript de mapas interativos 
* [jsPDF](https://parall.ax/products/jspdf) - Biblioteca JavaScript para criação de arquivos PDF
* [Plotly](https://plot.ly/javascript/) - Biblioteca JavaScript para criação de gráficos
