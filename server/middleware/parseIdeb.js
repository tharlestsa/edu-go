/**
 * @module server/middleware/parseIdeb
 *
 * @description Script encarregado de agrupar todas as informações oriundas da tabela de IDEB de um determinado município em um objeto.
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */
module.exports = {

    parse: function(dbobject) {
        let dadosIdeb = {};

        for (let i = 0; i < dbobject.length; i++) {
            dadosIdeb[dbobject[i].Municipio] = [];
        }

        for (let i = 0; i < dbobject.length; i++) {

            if (dadosIdeb[dbobject[i].Municipio]) {
                dadosIdeb[dbobject[i].Municipio].push({
                    id_ideb: dbobject[i].id_ideb,
                    ano: dbobject[i].ano,
                    classe: dbobject[i].classe,
                    indice: dbobject[i].indice,
                    meta: dbobject[i].meta,
                    atingiu_meta: dbobject[i].atingiu_meta,
                    cod_municipio: dbobject[i].cod_municipio
                })
            }
        }

        return dadosIdeb;

    }

};