const bcrypt = require("bcrypt");

async function testarSenha() {
    const senha = "minhaSenha123";

    // Gerando o hash
    const hash = await bcrypt.hash(senha, 10);

    console.log("Senha original:", senha);
    console.log("Hash gerado:", hash);

    // Comparando a senha correta
    const senhaCorreta = await bcrypt.compare(senha, hash);

    console.log("Senha correta?", senhaCorreta);

    // Comparando uma senha incorreta
    const senhaErrada = await bcrypt.compare("outraSenha456", hash);

    console.log("Senha errada?", senhaErrada);
}

testarSenha();