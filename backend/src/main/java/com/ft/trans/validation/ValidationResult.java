import java.util.ArrayList;
import java.util.List;


public record DomainError(String field, String message) {}


public class	ValidationResult
{
	private List<DomainError>	errors = new ArrayList<>();

	public void					addError(String field, String erroMsg)
	{
		this.errors.add(new DomainError(field, erroMsg));
	}

	public Boolean				hasErros()
	{
		return !this.errors.isEmpty();
	}

	public List<DomainError>	getErrors()
	{
		return List.copyOf(this.errors);
	}

}
