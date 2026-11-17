#!/usr/bin/env python3
"""Lê o relatório JSON do OWASP ZAP e falha se houver alerta de risco ALTO."""
import json
import os
import sys

arquivo = sys.argv[1] if len(sys.argv) > 1 else "zap-out/relatorio-zap.json"

if not os.path.isfile(arquivo):
    print(f"ERRO: o relatório {arquivo} não foi gerado")
    sys.exit(1)

with open(arquivo, encoding="utf-8") as f:
    dados = json.load(f)

alertas = [a for site in dados.get("site", []) for a in site.get("alerts", [])]
altos = [a for a in alertas if str(a.get("riskcode")) == "3"]

print(f"Total de alertas encontrados: {len(alertas)}")
for a in alertas:
    print(f"- [{a.get('riskdesc', '?')}] {a.get('name', '?')}")

if altos:
    print(f"ERRO: {len(altos)} alerta(s) de risco ALTO encontrado(s)")
    sys.exit(1)

print("OK: nenhum alerta de risco alto.")
