"""
Validadores customizados para o projeto
"""
import re
from typing import Any
from pydantic import validator

class CPFValidator:
    """Validador de CPF"""
    
    @staticmethod
    def validate_cpf(cpf: str) -> str:
        """Validar CPF brasileiro"""
        # Remove caracteres não numéricos
        cpf = re.sub(r'[^0-9]', '', cpf)
        
        # Verifica se tem 11 dígitos
        if len(cpf) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        
        # Verifica se não é uma sequência de números iguais
        if cpf == cpf[0] * 11:
            raise ValueError('CPF inválido')
        
        # Algoritmo de validação do CPF
        def calculate_digit(cpf_partial: str, weights: list) -> int:
            total = sum(int(digit) * weight for digit, weight in zip(cpf_partial, weights))
            remainder = total % 11
            return 0 if remainder < 2 else 11 - remainder
        
        # Primeiro dígito verificador
        first_digit = calculate_digit(cpf[:9], list(range(10, 1, -1)))
        if int(cpf[9]) != first_digit:
            raise ValueError('CPF inválido')
        
        # Segundo dígito verificador
        second_digit = calculate_digit(cpf[:10], list(range(11, 1, -1)))
        if int(cpf[10]) != second_digit:
            raise ValueError('CPF inválido')
        
        return cpf

class CNPJValidator:
    """Validador de CNPJ"""
    
    @staticmethod
    def validate_cnpj(cnpj: str) -> str:
        """Validar CNPJ brasileiro"""
        # Remove caracteres não numéricos
        cnpj = re.sub(r'[^0-9]', '', cnpj)
        
        # Verifica se tem 14 dígitos
        if len(cnpj) != 14:
            raise ValueError('CNPJ deve ter 14 dígitos')
        
        # Verifica se não é uma sequência de números iguais
        if cnpj == cnpj[0] * 14:
            raise ValueError('CNPJ inválido')
        
        # Algoritmo de validação do CNPJ
        def calculate_digit(cnpj_partial: str, weights: list) -> int:
            total = sum(int(digit) * weight for digit, weight in zip(cnpj_partial, weights))
            remainder = total % 11
            return 0 if remainder < 2 else 11 - remainder
        
        # Primeiro dígito verificador
        first_weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        first_digit = calculate_digit(cnpj[:12], first_weights)
        if int(cnpj[12]) != first_digit:
            raise ValueError('CNPJ inválido')
        
        # Segundo dígito verificador
        second_weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        second_digit = calculate_digit(cnpj[:13], second_weights)
        if int(cnpj[13]) != second_digit:
            raise ValueError('CNPJ inválido')
        
        return cnpj

class PhoneValidator:
    """Validador de telefone brasileiro"""
    
    @staticmethod
    def validate_phone(phone: str) -> str:
        """Validar telefone brasileiro"""
        # Remove caracteres não numéricos
        phone = re.sub(r'[^0-9]', '', phone)
        
        # Verifica formatos válidos
        if len(phone) not in [10, 11]:
            raise ValueError('Telefone deve ter 10 ou 11 dígitos')
        
        # Verifica se começa com código de área válido
        area_code = phone[:2]
        if not area_code.isdigit() or int(area_code) < 11 or int(area_code) > 99:
            raise ValueError('Código de área inválido')
        
        # Para celulares (11 dígitos), verifica se o 3º dígito é 9
        if len(phone) == 11 and phone[2] != '9':
            raise ValueError('Celular deve ter 9 como terceiro dígito')
        
        return phone

class EmailValidator:
    """Validador de email melhorado"""
    
    @staticmethod
    def validate_email(email: str) -> str:
        """Validar email com regex mais robusta"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValueError('Email inválido')
        
        # Verificações adicionais
        if '..' in email:
            raise ValueError('Email não pode conter pontos consecutivos')
        
        if email.startswith('.') or email.endswith('.'):
            raise ValueError('Email não pode começar ou terminar com ponto')
        
        return email.lower()

def validate_cpf_cnpj(value: str) -> str:
    """Validar CPF ou CNPJ automaticamente"""
    if not value:
        raise ValueError('CPF/CNPJ é obrigatório')
    
    # Remove caracteres especiais
    clean_value = re.sub(r'[^0-9]', '', value)
    
    if len(clean_value) == 11:
        return CPFValidator.validate_cpf(clean_value)
    elif len(clean_value) == 14:
        return CNPJValidator.validate_cnpj(clean_value)
    else:
        raise ValueError('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos')
