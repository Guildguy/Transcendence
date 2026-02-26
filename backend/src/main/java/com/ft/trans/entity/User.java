package com.ft.trans.entity;

import java.sql.Date;

import org.passay.CharacterRule;
import org.passay.EnglishCharacterData;
import org.passay.LengthRule;
import org.passay.PasswordData;
import org.passay.PasswordValidator;
import org.passay.WhitespaceRule;

import com.ft.trans.service.PasswordService;
import com.ft.trans.utils.StringUtils;
import com.ft.trans.validation.ValidationResult;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;


@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(name = "email", columnNames = "email"),
    @UniqueConstraint(name = "phone_number", columnNames = "phone_number"),
	@UniqueConstraint(name = "username", columnNames = "username")
})
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Long		id;
	@Column(nullable = false)
    public String	email;
	public String	name;
	@Column(nullable = false)
	public String	username;
	public Boolean	status;
	public Date		created_at;
	public String	created_by;
	public Date		last_update_at;
	public String	last_update_by;
	@Column(nullable = false)
	public String	phone_number;
	@Column(nullable = false)
	public String	password;

	private void isNameValid(ValidationResult result)
	{
		this.name = this.name != null ? this.name.trim() : "";

		if (this.name.isBlank())
			result.addError("name", "Nome em branco.");
		if (this.name.length() < 3 || this.name.length() > 100)
			result.addError("name", "Nome muito pequeno ou muito grande.");
		if (!StringUtils.isAlphaOnly(this.name))
			result.addError("name", "O nome deve conter apenas caracteres alfabeticos e espaços.");
	}

	private void	isPhoneValid(ValidationResult result)
	{
		this.phone_number = this.phone_number != null ? this.phone_number.trim().replaceAll("\\D", "") : "";

		if (this.phone_number.isBlank())
			result.addError("phone_number", "Numero em branco.");
		if (!this.phone_number.matches("^\\d{10,11}$"))
			result.addError("phone_number", "Numero inválido.");
	}

	private void	isEmailValid(ValidationResult result)
	{
		this.email = this.email != null ? this.email.trim() : "";

		if (this.email.isBlank())
			result.addError("email", "Email em branco.");
		if (!this.email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$"))
			result.addError("email", "Email invalido.");
	}

	private void isPasswordValid(ValidationResult result)
	{
		PasswordValidator validator = new PasswordValidator(
			new LengthRule(8, 30),
			new CharacterRule(EnglishCharacterData.UpperCase, 1),
			new CharacterRule(EnglishCharacterData.LowerCase, 1),
			new CharacterRule(EnglishCharacterData.Digit, 1),
			new CharacterRule(EnglishCharacterData.Special, 1),
			new WhitespaceRule()
		);
		if (!validator.validate(new PasswordData(this.password)).isValid())
			result.addError("password", "Senha não segue a politica de senhas.");
	}

	public ValidationResult	validate()
	{
		ValidationResult	result = new ValidationResult();

		isNameValid(result);
		isPhoneValid(result);
		isEmailValid(result);
		isPasswordValid(result);

		return result;
	}

	public void				encodePassword()
	{
		this.password = new PasswordService().hashPassword(this.password);
	}
}
