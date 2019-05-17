/**
 * @module server/middleware/repository
 *
 * @description Módulo de acesso ao Banco de dados e busca das informações das informações
 *
 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 */
const mysql = require('mysql');
const fs = require('fs');
const asyncLoop = require('node-async-loop');
const parsedb = require('./parsedb.js');
const parseTransporte = require('./parseTransporte.js');
const parseFinanciamento = require('./parseFinanciamento.js');
const parseIdeb = require('./parseIdeb.js');

const db_config = {
    host: '127.0.0.1',
    user: 'user',
    password: 'password',
    database: 'CaoEdu'
}

let connection;
/**
 * @function handleDisconnect
 *
 * @description Função encarregada de realizar a conexão com o banco de dados.
 */
function handleDisconnect() {
    connection = mysql.createConnection(db_config);


    connection.connect(function(err) {
        if (err) {
            console.log('Erro ao tentar conectar com MySQL:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    connection.on('error', function(err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
            console.log('A conexão com MySQL foi perdida, porém um novo processo de conexão foi iniciado.');
        } else {
            throw err;
        }
    });
}



module.exports = function(app) {

    handleDisconnect();

    Repository = {};

    Repository.municipios = function(context, next) {
        let municipios = JSON.parse(fs.readFileSync(__dirname + '/../geospatial/goias.geojson', 'utf8'));
        context.municipios = municipios
        return next();
    }

    Repository.db = function(context, next) {
        connection.query(
            'SELECT Municipios.Municipio,\
              	SchoolarData.Cod_Munic,\
                SchoolarData.Ano, \
                SchoolarData.Pop_0_3,\
                SchoolarData.Pop_4_5,\
                SchoolarData.Mat_Creche_Nun,\
                SchoolarData.Mat_Creche_Per,\
                SchoolarData.Mat_Pre_Esc_Nun,\
  				SchoolarData.Mat_Pre_Esc_Per\
			FROM Municipios JOIN SchoolarData\
			    ON Municipios.Cod_Munic = SchoolarData.Cod_Munic\
            ORDER BY SchoolarData.Ano DESC',
            function(error, results, fields) {
                if (error) {
                    console.log(error);
                } else {
                    let mpdata = JSON.parse(JSON.stringify(results));
                    let modataparsed = parsedb.parse(mpdata);
                    context.mpdata = modataparsed;
                    next();
                }
            });

    }

    /*Retorna coleção de dados da tabela de dados dos transportes escolares
      dos municípios do Estado de Goiás */
    Repository.dadosTransporte = function(context, next) {
        connection.query(
            'SELECT Municipios.Municipio,\
              	Transporte.id_transporte,\
            	Transporte.ano,\
                Transporte.semestre, \
                Transporte.pp,\
                Transporte.aprov,\
                Transporte.reprov,\
                Transporte.nao_comp,\
                Transporte.total,\
                Transporte.p_aprov,\
  				Transporte.p_reprov,\
  				Transporte.p_naocomp,\
  				Transporte.cod_municipio \
			FROM Municipios JOIN Transporte \
			    ON Municipios.Cod_Munic = Transporte.cod_municipio \
            ORDER BY Transporte.ano DESC',
            function(error, results, fields) {
                if (error) {
                    console.log(error);
                } else {
                    let mpdata = JSON.parse(JSON.stringify(results));
                    let modataparsed = parseTransporte.parse(mpdata);
                    context.dadosTransporte = modataparsed;
                    next();
                }
            });

    }

    /*Retorna coleção de dados da tabela de dados do financiamento escolar
    dos municípios do Estado de Goiás */
    Repository.dadosFinanciamento = function(context, next) {
        connection.query(
            'SELECT Municipios.Municipio,\
              	Financiamento.id_financiamento,\
            	Financiamento.ano,\
                Financiamento.item1_mde,\
                Financiamento.item1_fundeb,\
                Financiamento.itens3e4_mde_edu_inf,\
                Financiamento.itens3e4_mde_edu_fun,\
                Financiamento.itens3e4_fundeb_pag_mag,\
                Financiamento.itens3e4_fundeb_outras_desp,\
                Financiamento.dedu_const,\
  				Financiamento.item2_perc_cert,\
  				Financiamento.cod_municipio \
			FROM Municipios JOIN Financiamento \
			    ON Municipios.Cod_Munic = Financiamento.cod_municipio \
            ORDER BY Financiamento.ano DESC',
            function(error, results, fields) {
                if (error) {
                    console.log(error);
                } else {
                    let mpdata = JSON.parse(JSON.stringify(results));
                    let modataparsed = parseFinanciamento.parse(mpdata);
                    context.dadoFinanciamento = modataparsed;
                    next();
                }
            });

    }

    /*Retorna coleção de dados da tabela de dados do IDEB
    dos municípios do Estado de Goiás */
    Repository.dadosIdeb = function(context, next) {
        connection.query(
            'SELECT Municipios.Municipio,\
              	Ideb.id_ideb,\
            	Ideb.ano,\
                Ideb.classe,\
                Ideb.indice,\
                Ideb.meta,\
                Ideb.atingiu_meta,\
    			Ideb.cod_municipio \
			FROM Municipios JOIN Ideb \
			    ON Municipios.Cod_Munic = Ideb.cod_municipio \
            ORDER BY Ideb.ano DESC',
            function(error, results, fields) {
                if (error) {
                    console.log(error);
                } else {
                    let mpdata = JSON.parse(JSON.stringify(results));
                    let modataparsed = parseIdeb.parse(mpdata);
                    context.dadosIdeb = modataparsed;
                    next();
                }
            });

    }

    /*Retorna coleção de dados da tabela de dados do IDEB
	dos municípios do Estado de Goiás */
    Repository.mun = function(context, next) {
        connection.query(
            'SELECT * \
			FROM Municipios ',
            function(error, results, fields) {
                if (error) {
                    console.log(error);
                } else {
                    let mun = JSON.parse(JSON.stringify(results));
                    context.mun = mun;
                    next();
                }
            });

    }

    return Repository;

}