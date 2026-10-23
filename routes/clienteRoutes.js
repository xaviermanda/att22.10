const express = require("express");
const router = express.Router();
const ClienteController = require("../controllers/ClienteController");
router.get("/", ClienteController.listar);
router.get("/:id", ClienteController.consultar);
router.post("/", ClienteController.cadastrar);
router.put("/:id", ClienteController.alterar);
router.delete("/:id", ClienteController.excluir);
module.exports = router;
