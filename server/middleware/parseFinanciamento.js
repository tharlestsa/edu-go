/**
 * @module server/middleware/parseFinanciamento
 *
 * @description Script encarregado de agrupar todas as informações oriundas da tabela de Fiananciemento da Educação de um determinado município em um objeto.
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */
module.exports = {

    parse: function(dbobject) {
        let dadosFinanciamento = {};
        // console.log(JSON.stringify(dbobject, null, 2));
        for (let i = 0; i < dbobject.length; i++) {
            dadosFinanciamento[dbobject[i].Municipio] = [];
        }

        for (let i = 0; i < dbobject.length; i++) {

            if (dadosFinanciamento[dbobject[i].Municipio]) {
                dadosFinanciamento[dbobject[i].Municipio].push({
                    id_financiamento: dbobject[i].id_financiamento,
                    ano: dbobject[i].ano,
                    item1_mde: dbobject[i].item1_mde,
                    item1_fundeb: dbobject[i].item1_fundeb,
                    itens3e4_mde_edu_inf: dbobject[i].itens3e4_mde_edu_inf,
                    itens3e4_mde_edu_fun: dbobject[i].itens3e4_mde_edu_fun,
                    itens3e4_fundeb_pag_mag: dbobject[i].itens3e4_fundeb_pag_mag,
                    itens3e4_fundeb_outras_desp: dbobject[i].itens3e4_fundeb_outras_desp,
                    dedu_const: dbobject[i].dedu_const,
                    item2_perc_cert: dbobject[i].item2_perc_cert,
                    cod_municipio: dbobject[i].cod_municipio
                })
            }
        }

        return dadosFinanciamento;

    }

};