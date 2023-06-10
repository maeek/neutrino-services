import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'isOneOf', async: false })
class IsOneOfStringValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    const [relatedPropertyName, relatedPropertyName2] = args.constraints;
    return (
      text.includes(relatedPropertyName) || text.includes(relatedPropertyName2)
    ); // for both conditions
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName, relatedPropertyName2] = args.constraints;
    return `Text ($value) must contain "${relatedPropertyName}" or "${relatedPropertyName2}"`;
  }
}

export function IsOneOf(
  constraints: any[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isOneOf',
      target: object.constructor,
      propertyName: propertyName,
      constraints,
      options: validationOptions,
      validator: IsOneOfStringValidator,
    });
  };
}
