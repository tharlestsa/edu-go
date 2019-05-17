/**
 * @module server/routers/geojson
 *
 * @description Código de definição da rotas de acesso aos dados da educação,
 * que serão requisitados pelos clientes quando forem montar os mapas e gráficos
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */
module.exports = function(app) {

    var routerGeo = {}

    routerGeo.geojson = function(context, next) {

        app.get('/geojson', function(request, response) {

            response.send(context.municipios)

        });

        app.get('/mpdata', function(request, response) {

            response.send(context.mpdata)

        });

        app.get('/transporte', function(request, response) {

            response.send(context.dadosTransporte)

        });

        app.get('/financiamento', function(request, response) {

            response.send(context.dadoFinanciamento)

        });

        app.get('/ideb', function(request, response) {

            response.send(context.dadosIdeb)

        });


        app.get('/mun', function(request, response) {

            response.send(context.mun)

        });

    }

    return routerGeo;

};