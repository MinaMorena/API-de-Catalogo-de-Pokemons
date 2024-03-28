const pool = require('../conexao')
const jwt = require('jsonwebtoken')

const verificarUsuarioLogado = async (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({ mensagem: 'Não autorizado' })
    }

    const token = authorization.split(' ')[1]
    try {
        const { id } = await jwt.verify(token, 'senhaSeguraDemais')

        const { rows, rowCount } = await pool.query('select * from usuarios where id = $1', [id])

        if (rowCount < 1) {
            return res.status(401).json({ mensagem: 'Não autorizado' })
        }

        const { senha, ...usuario } = rows[0]
        req.usuario = usuario

        next()
    } catch (error) {
        return res.status(401).json({ mensagem: 'Não autorizado' })
    }
}

module.exports = verificarUsuarioLogado