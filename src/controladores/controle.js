const banco = require('../bancodedados');
let { contas, saques, depósitos, transferencias } = require('../bancodedados');
const fs = require('fs/promises');

const listarContas = async (req, res) => {
    const { senha_banco } = req.query;

    if (!senha_banco) {
        return res.status(400).json({ mensagem: "Informe uma senha!" });
    }

    if (senha_banco !== banco.banco.senha) {
        return res.status(400).json({ mensagem: "A senha do banco informada é inválida!" });
    }

    return res.status(200).json(banco.contas);
}

const criarConta = async (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: "Informe um nome!" });
    }

    const buscar_cpf = banco.contas.find((conta) => {
        return Number(conta.usuario.cpf) === Number(cpf);
    });

    if (buscar_cpf) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o cpf informado!" });

    }

    if (cpf.length !== 11 || !cpf) {
        return res.status(400).json({ mensagem: "Informe um cpf válido!" });
    }

    if (!data_nascimento) {
        return req.status(400).json({ mensagem: 'Informe uma data de nascimento' })

    }

    const buscar_telefone = banco.contas.find((conta) => {
        return Number(conta.usuario.telefone) === Number(telefone);
    });

    if (buscar_telefone) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o telefone informado!" });
    }

    if (!telefone) {
        return res.status(400).json({ mensagem: "Informe um telefone válido!" });
    }

    const buscar_email = banco.contas.find((conta) => {
        return conta.usuario.email === email;
    });

    if (buscar_email) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o email informado!" });
    }

    if (!email) {
        return res.status(400).json({ mensagem: "Informe um e-mail válido!" });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: "Informe uma senha!" });
    }
    banco.identificadoDeConta += 1
    const conta = {
        numero: banco.identificadoDeConta,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    banco.contas.push(conta);
    return res.status(201).json();
}

const atualizarConta = async (req, res) => {
    const { numeroConta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const buscarConta = banco.contas.find((conta) => {
        return Number(conta.numero) === Number(numeroConta);
    });

    if (!buscarConta) {
        return res.status(400).json({ mensagem: 'Conta não encontrada.' });
    }

    if (!nome) {
        return res.status(400).json({ mensagem: "Informe um nome!" });
    }

    const buscar_cpf = banco.contas.find((conta) => {
        return Number(conta.usuario.cpf) === Number(cpf);
    });

    if (buscar_cpf) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o cpf informado!" });

    }

    if (cpf.length !== 11 || !cpf) {
        return res.status(400).json({ mensagem: "Informe um cpf válido!" });
    }

    if (!data_nascimento) {
        return req.status(400).json({ mensagem: 'Informe uma data de nascimento' })

    }

    const buscar_telefone = banco.contas.find((conta) => {
        return Number(conta.usuario.telefone) === Number(telefone);
    });

    if (buscar_telefone) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o telefone informado!" });
    }

    if (!telefone) {
        return res.status(400).json({ mensagem: "Informe um telefone válido!" });
    }

    const buscar_email = banco.contas.find((conta) => {
        return conta.usuario.email === email;
    });

    if (buscar_email) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o email informado!" });
    }

    if (!email) {
        return res.status(400).json({ mensagem: "Informe um e-mail válido!" });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: "Informe uma senha!" });
    }

    buscarConta.usuario = {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    }

    return res.status(204).send();
}

const deletarConta = async (req, res) => {
    const { numeroConta } = req.params;

    const buscarConta = banco.contas.find((conta) => {
        return Number(conta.numero) === Number(numeroConta);
    });

    if (!buscarConta) {
        return res.status(400).json({ mensagem: 'Conta não encontrada.' });
    }

    if (buscarConta.saldo !== 0) {
        return res.status(400).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" });
    }

    banco.contas = banco.contas.filter((conta) => {
        return Number(conta.numero) !== Number(numeroConta);
    });
    console.log(banco.contas);

    return res.status(200).json();
}

const depositar = async (req, res) => {
    const { numero_conta, valor } = req.body;

    const buscarConta = banco.contas.find((conta) => {
        return Number(conta.numero) === Number(numero_conta);
    });

    if (!buscarConta) {
        return res.status(400).json({ mensagem: 'Conta não encontrada.' });
    }

    if (!valor || valor <= 0) {
        return res.status(400).json({ mensagem: 'Valor inválido' });
    }

    buscarConta.saldo += valor;

    const deposito = {
        data: new Date().toLocaleString(),
        numero_conta,
        valor
    }

    banco.depositos.push(deposito);
    console.log(banco.depositos);

    return res.status(200).json();
}

const sacar = async (req, res) => {
    const {numero_conta, valor, senha} = req.body;

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ mensagem: "Todo os campos precisam ser preenchidos" });
    }

    const buscarConta = banco.contas.find((conta) => {
        return Number(conta.numero) === Number(numero_conta);
    });

    if (!buscarConta) {
        return res.status(400).json({ mensagem: 'Conta não encontrada.' });
    }

    if (senha !== buscarConta.usuario.senha) {
        return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    if (valor > buscarConta.saldo) {
        return res.status(400).json({ mensagem: "Saldo insuficiente!" });
    }

    buscarConta.saldo -= valor;

    const saque = {
        data: new Date().toLocaleString(),
        numero_conta,
        valor
    }

    banco.saques.push(saque);
    console.log(banco.saques);
    return res.status(200).json();
}

const transferir = async (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_destino || !numero_conta_origem || !valor || !senha) {
        return res.status(400).json({ mensagem: "Todo os campos precisam ser preenchidos" });
    }

    const buscarContaOrigem = banco.contas.find((conta) => {
        return Number(conta.numero) === Number(numero_conta_origem);
    });

    if (!buscarContaOrigem) {
        return res.status(400).json({ mensagem: 'Conta de origem não encontrada.' });
    }

    const buscarContaDestino = banco.contas.find((conta) => {
        return Number(conta.numero) === Number(numero_conta_destino);
    });

    if (!buscarContaDestino) {
        return res.status(400).json({ mensagem: 'Conta de destino não encontrada.' });
    }

    if (senha !== buscarContaOrigem.usuario.senha) {
        return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    if (valor > buscarContaOrigem.saldo) {
        return res.status(400).json({ mensagem: "Saldo insuficiente!" });
    }

    if (buscarContaDestino.numero === buscarContaOrigem.numero){
        return res.status(400).json({ mensagem: "A conta de destino precisa ser diferente da conta de origem" });
    }

    buscarContaOrigem.saldo -= valor;
    buscarContaDestino.saldo += valor;
    
    const transferencia = {
        data: new Date().toLocaleString(),
        numero_conta_origem,
        numero_conta_destino,
        valor
    }

    banco.transferencias.push(transferencia);
    console.log(banco.transferencias);

    return res.status(200).json();
}

const saldo = async (req, res) => {
    const {numero_conta, senha} = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "Número de conta ou senha não informado" });
    }

    const buscarConta = banco.contas.find((conta) => {
        return Number(conta.numero) === Number(numero_conta);
    });

    if (!buscarConta) {
        return res.status(400).json({ mensagem: 'Conta bancária não encontada!' });
    }

    if (senha !== buscarConta.usuario.senha) {
        return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    return res.status(200).json({saldo: buscarConta.saldo });
}

const extrato = async (req, res) => {
    const {numero_conta, senha} = req.query;
    
    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "Número de conta ou senha não informado" });
    }

    const buscarConta = banco.contas.find((conta) => {
        return Number(conta.numero) === Number(numero_conta);
    });

    if (!buscarConta) {
        return res.status(400).json({ mensagem: 'Conta bancária não encontada!' });
    }

    if (senha !== buscarConta.usuario.senha) {
        return res.status(400).json({ mensagem: 'Senha inválida' });
    }

    const depositosRecebido = banco.depositos.filter((deposito) => {
        return Number(deposito.numero_conta) === Number(numero_conta);
    });

    const saquesEfetuados = banco.saques.filter((saque) => {
        return Number(saque.numero_conta) === Number(numero_conta);
    });

    const tranferenciasEnviadas = banco.transferencias.filter((transferencia) => {
        return Number(transferencia.numero_conta_origem) === Number(numero_conta);
    });

    const tranferenciasRecebidas = banco.transferencias.filter((transferencia) => {
        return Number(transferencia.numero_conta_destino) === Number(numero_conta);
    });


    return res.status(200).json({ 
        depositos: depositosRecebido,
        saques: saquesEfetuados,
        tranferenciasEnviadas,
        tranferenciasRecebidas });
}

module.exports = {
    listarContas,
    criarConta,
    atualizarConta,
    deletarConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
}