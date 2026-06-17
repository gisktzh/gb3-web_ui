import {Type, TypeChecker, TypeFlags, TypeReference} from 'typescript';

function unwrapPromise(type: Type, checker: TypeChecker): Type {
  if (type.symbol?.name === 'Promise' && checker.getTypeArguments(type as TypeReference).length) {
    return checker.getTypeArguments(type as TypeReference)[0];
  }

  return type;
}

export function getDefaultValueForType(type: Type, checker: TypeChecker): string {
  type = unwrapPromise(type, checker);

  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    return '[]';
  }

  if (type.flags & TypeFlags.String) {
    return "''";
  }

  if (type.flags & TypeFlags.Number) {
    return '0';
  }

  if (type.flags & TypeFlags.Boolean) {
    return 'false';
  }

  if (type.flags & TypeFlags.Void) {
    return 'undefined';
  }

  if (type.flags & TypeFlags.Null) {
    return 'null';
  }

  if (type.flags & TypeFlags.Undefined) {
    return 'undefined';
  }

  if (type.flags & TypeFlags.Object) {
    return '{}';
  }

  const escapedName = type.aliasSymbol?.escapedName;

  if (escapedName === 'ScreenMode') {
    return "'regular'";
  }

  return 'undefined';
}
