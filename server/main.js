/**
 * @module server/main
 * 
 * @description Servidor da Aplicação, responsável por iniciar os serviços que serão requisitado pelos clientes.
 * 
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */

/**
 * Declaração das dependências utilizadas no servidor
 *
 */
var express = require('express');
var consign = require('consign');
var chain = require('middleware-chain');
var bodyParser = require('body-parser');
var ip = require('ip');
var app = express();
var fs = require('fs');
var erros = require('./utils/erros.js');
var path = require('path');

/**
 * Configurações para debug do programa
 *
 */
const debug = require('debug')('my-namespace');
const name = 'App CAO Educacao';
debug('booting %s', name);

/**
 * Disponibilização de rotas para os módulos da aplicação.
 *
 */
app.use(express.static(__dirname + './../client/'));
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use('/principal', express.static(__dirname + './../client/'));
app.use('/erros', express.static(__dirname + './../client/pages/erros/404.html'));


consign()
    .include('middleware')
    .then('routers')
    .into(app);

chain([
    app.middleware.repository.municipios,
    app.middleware.repository.db,
    app.middleware.repository.dadosTransporte,
    app.middleware.repository.dadosFinanciamento,
    app.middleware.repository.dadosIdeb,
    app.middleware.repository.mun,
    app.routers.geojson.geojson
]);

/**
 * Definição da porta em que a aplicação irá ser executada.
 *
 */
app.listen(3000, function() {
    console.log("Servidor da Plataforma do CAO Educação disponível no endereço: http://" + ip.address())
});