#!/usr/bin/env node

/**
 * @module server/utils/insereDadosMatriculas

 * @version    1.0.0
 * @author     Tharles de Sousa Andrade
 * @copyright  Copyright (c) 2019 Tharles de Sousa Andrade
 * @license    MIT
 *
 *
 * @description Código responsável por ler um arquivo com os dados de Matrículas da Educação Infantil no formato CSV e
 * convertê-lo em instruções de inserção SQL. Apos a conversão, as inserções serão executadas por meio de uma transação,
 * caso tenha algum problema em alguma linha ou erro não serão inseridos nenhum registro.
 *
 * OBS: o cabeçalho do arquivo CSV deve ser obrigatoriamente igual as colunas da tabala abaixo.
 *
 * <p>
 * <pre>
 * -----------------------------------------------------------------------------------------------------------------------------
 * |  Ano  |  Pop_0_3  |  Pop_4_5  |  Mat_Creche_Nun  |  Mat_Creche_Per  |  Mat_Pre_Esc_Nun  |  Mat_Pre_Esc_Per  |  Cod_Munic  |
 * -----------------------------------------------------------------------------------------------------------------------------
 * </pre>
 * <p>
 * Comando para executar os programa de inserção do dados.
 *
 * <pre>
 * ./insereDadosMatriculas.js dbhost dbuser dbpassword dbname matriculas.csv
 * </pre>
 */

'use strict';

const csv = require('csv-tools');
const mysql = require('mysql');


const dbhost = process.argv[2];
const dbuser = process.argv[3];
const dbpass = process.argv[4];
const dbname = process.argv[5];
const csvfn = process.argv[6];

/**
 * @function   executaTransacaoDeArrayDeQuerys
 *
 * @description Função responsável por executar todas as instruções SQL de inserção dentro de uma transação.
 *
 * @param  {Object} connection    Objeto de conxeção com mysql
 * @param  {Array}  arrayDeQuerys Lista de INSERTS
 */
function executaTransacaoDeArrayDeQuerys(connection, arrayDeQuerys) {

    /* Início da transação */
    connection.beginTransaction(function(erro) {

        if (erro) { throw erro; }
        var registros = 0;
        arrayDeQuerys.forEach(function(value) {
            connection.query(value, function(erro, results, fields) {
                if (erro) {
                    // console.log('Transação Abortada!');
                    connection.rollback(function() {
                        console.log("\n PROBLEMA NO REGISTRO: " + value + "\n");
                        throw erro;
                    });
                    return;
                }
            });
            registros++;
        });

        console.log("\n TOTAL DE REGISTROS: " + registros + "\n");

        connection.commit(function(erro) {

            if (erro) {
                console.log('Transação Abortada!');
                connection.rollback(function() {
                    throw erro;
                });
            }
            connection.end();
        });

    });

    /* Fim da transação */
}

csv.fileToJSON(csvfn, function(json) {

    try {
        var connection = mysql.createConnection({
            host: dbhost,
            user: dbuser,
            password: dbpass,
            database: dbname
        });

        connection.connect((erro) => {
            if (erro) {
                console.error('Erro de conexão com banco de dados: ' + erro.stack);
                throw erro;
            }
        });

        var arrayDeQuerys = [];

        json.forEach(function(value) {
            arrayDeQuerys.push("INSERT INTO SchoolarData VALUES (NULL," +
                value.Ano + "," +
                value.Pop_0_3 + "," +
                value.Pop_4_5 + "," +
                value.Mat_Creche_Nun + "," +
                value.Mat_Creche_Per + "," +
                value.Mat_Pre_Esc_Nun + "," +
                value.Mat_Pre_Esc_Per + "," +
                value.Cod_Munic + ")");
        });

        executaTransacaoDeArrayDeQuerys(connection, arrayDeQuerys);

    } catch (erro) {
        console.log("\n Erro: " + erro + "\n");
    }

});