# Example Document Template

To test the application, create a Word document (.docx) with placeholders in any of these formats:

## Supported Placeholder Formats

- `{{placeholder_name}}`
- `[placeholder_name]`
- `{placeholder_name}`

## Example Template

Create a Word document with content like this:

```
EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on {{date}} between {{company_name}} ("Company") and {{employee_name}} ("Employee").

1. POSITION
   Employee shall serve as [job_title] and shall report to {{manager_name}}.

2. COMPENSATION
   Employee shall receive a base salary of ${{salary_amount}} per year.

3. START DATE
   Employee's start date shall be {start_date}.

4. LOCATION
   Employee's primary work location shall be [work_location].

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

{{company_name}}

By: {{signatory_name}}
Title: {{signatory_title}}

{{employee_name}}
```

## Testing Tips

1. Save the document as a .docx file
2. Upload it to the application
3. The app will detect all placeholders automatically
4. Use the conversation interface to fill them in
5. Download the completed document

## Placeholder Naming Best Practices

- Use descriptive names: `company_name` instead of `name1`
- Use snake_case or kebab-case: `employee_name` or `employee-name`
- Avoid special characters that might conflict with regex patterns
- Keep names concise but clear

