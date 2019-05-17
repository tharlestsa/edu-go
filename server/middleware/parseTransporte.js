/**
 * @module server/middleware/parseTransporte
 *
 * @description Script encarregado de agrupar todas as informações oriundas da tabela de Transporte Escolar
 * de um determinado município em um objeto.
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */
module.exports = {

    parse: function(dbobject) {
        let dadosTransporte = {};
        for (let i = 0; i < dbobject.length; i++) {
            dadosTransporte[dbobject[i].Municipio] = [];
        }

        for (let i = 0; i < dbobject.length; i++) {

            if (dadosTransporte[dbobject[i].Municipio]) {
                dadosTransporte[dbobject[i].Municipio].push({
                    id_transporte: dbobject[i].id_transporte,
                    ano: dbobject[i].ano,
                    semestre: dbobject[i].semestre,
                    pp: dbobject[i].pp,
                    aprov: dbobject[i].aprov,
                    reprov: dbobject[i].reprov,
                    nao_comp: dbobject[i].nao_comp,
                    total: dbobject[i].total,
                    p_aprov: dbobject[i].p_aprov,
                    p_reprov: dbobject[i].p_reprov,
                    p_naocomp: dbobject[i].p_naocomp,
                    cod_municipio: dbobject[i].cod_municipio
                })
            }
        }

        return dadosTransporte;

    }

};