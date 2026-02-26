package com.ft.trans.entity;

import java.sql.Date;

import org.passay.CharacterRule;
import org.passay.EnglishCharacterData;
import org.passay.LengthRule;
import org.passay.PasswordData;
import org.passay.PasswordValidator;
import org.passay.WhitespaceRule;

import com.ft.trans.utils.StringUtils;
import com.ft.trans.validation.ValidationResult;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity
@Table(name = "users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long	id;
	// @Column(unique = true, nullable = false)
    private String	email;
	private String	name;
	// @Column(unique = true, nullable = false)
	private String	username;
	private String	status;
	private Date	created_at;
	private String	created_by;
	private Date	last_update_at;
	private String	last_update_by;
	// @Column(unique = true, nullable = false)
	private String	phone_number;
	@Column(nullable = false)
	private String	password;

	private

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

	private boolean	isPhoneValid(ValidationResult result)
	{
		this.phone_number = this.phone_number != null ? this.phone_number.trim().replaceAll("\\D", "") : "";

		if (this.phone_number.isBlank())
			result.addError("phone_number", "Numero em branco.");
		if (!this.phone_number.matches("^\\d{10,11}$"))
			result.addError("phone_number", "Numero inválido.");
	}

	private boolean	isEmailValid(ValidationResult result)
	{
		this.email = this.email != null ? this.email.trim() : "";

		if (this.email.isBlank())
			result.addError("email", "Email em branco.");
		if (!this.email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$"))
			result.addError("email", "Email invalido.");
		return true;
	}

	private boolean isPasswordValid(ValidationResult result)
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

	public ValidationResult	isValidToBeCreated()
	{
		ValidationResult	result = new ValidationResult();

		isNameValid(result);
		isPhoneValid(result);
		isEmailValid(result);
		isPasswordValid(result);

		return result;
	}

	public Long		getId() {
		return id;
	}

	public void		setId(Long id) {
		this.id = id;
	}

	public String	getEmail() {
		return email;
	}

	public void		setEmail(String email) {
		this.email = email;
	}

	public String	getUsername() {
		return username;
	}

	public void		setUsername(String username) {
		this.username = username;
	}

	public String	getStatus() {
		return status;
	}

	public void		setStatus(String status) {
		this.status = status;
	}

	public Date		getCreated_at() {
		return created_at;
	}

	public void		setCreated_at(Date created_at) {
		this.created_at = created_at;
	}

	public String	getCreated_by() {
		return created_by;
	}

	public void		setCreated_by(String created_by) {
		this.created_by = created_by;
	}

	public Date		getLast_update_at() {
		return last_update_at;
	}

	public void		setLast_update_at(Date last_update_at) {
		this.last_update_at = last_update_at;
	}

	public String	getLast_update_by() {
		return last_update_by;
	}

	public void		setLast_update_by(String last_update_by) {
		this.last_update_by = last_update_by;
	}

	public String	getPhone_number() {
		return phone_number;
	}

	public void		setPhone_number(String phone_number) {
		this.phone_number = phone_number;
	}

	public String	getPassword()
	{
		return this.password;
	}

	public void		setPassword(String pass)
	{
		this.password = pass;
	}
	
}
