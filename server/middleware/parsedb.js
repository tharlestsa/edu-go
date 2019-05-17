/**
 * @module server/middleware/parsedb
 *
 * @description Script encarregado de agrupar todas as informações oriundas da tabela de Matrículas da Educação
 * Infantil de um determinado município em um objeto.
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Ministério Público do Estado de Goiás
 * @license    MIT
 */
module.exports = {

    parse: function(dbobject) {

        let cities = {};

        for (let i = 0; i < dbobject.length; i++) {
            cities[dbobject[i].Municipio] = [];
        }

        for (let i = 0; i < dbobject.length; i++) {

            if (cities[dbobject[i].Municipio]) {
                cities[dbobject[i].Municipio].push({
                    Cod_Munic: dbobject[i].Cod_Munic,
                    Ano: dbobject[i].Ano,
                    Pop_0_3: dbobject[i].Pop_0_3,
                    Pop_4_5: dbobject[i].Pop_4_5,
                    Mat_Creche_Nun: dbobject[i].Mat_Creche_Nun,
                    Mat_Creche_Per: dbobject[i].Mat_Creche_Per,
                    Mat_Pre_Esc_Nun: dbobject[i].Mat_Pre_Esc_Nun,
                    Mat_Pre_Esc_Per: dbobject[i].Mat_Pre_Esc_Per
                })
            }
        }
        return cities;

    }

};