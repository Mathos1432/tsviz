
export enum Visibility {
    Private,
    Public,
    Protected
}

export enum Lifetime {
    Static,
    Instance
}

let ModuleTypeName = "";
let ClassTypeName = "";
let MethodTypeName = "";
let PropertyTypeName = "";
let ImportedModuleTypeName = "";
let EnumTypeName = "";
let EnumMemberTypeName = "";
let InterfaceTypeName = "";

export class QualifiedName {
    private nameParts: string[];

    constructor(nameParts: string[]) {
        this.nameParts = nameParts;
    }

    public get parts(): string[] {
        return this.nameParts;
    }
}

export abstract class Element {
    constructor(private _name: string, private _parent: Element, private _visibility: Visibility = Visibility.Public, private _lifetime: Lifetime = Lifetime.Instance) {
        // TODO: Move this somewhere else.
        // This is done to regroup modules with the same name.
        this._name = this._name.replace('../', '').replace('./', '');
        if (this._name[0] == '.') {
            this._name = this._name.substr(1);
        }
        if (this._name.indexOf('angular') === -1) {
            this._name = this._name.substring(this._name.lastIndexOf('/') + 1);
        }
    }

    public get name(): string {
        return this._name;
    }

    public get visibility(): Visibility {
        return this._visibility;
    }

    public get lifetime(): Lifetime {
        return this._lifetime;
    }

    public get parent(): Element {
        return this._parent;
    }

    public addElement(element: Element) {
        this.getElementCollection(element).push(element);
    }

    protected getElementCollection(element: Element): Array<Element> {
        throw new Error(typeof element + " not supported in " + typeof this);
    }
}

export class Module extends Element {
    private _classes: Class[] = new Array<Class>();
    private _modules: Module[] = new Array<Module>();
    private _interfaces: Interface[] = new Array<Interface>();
    private _enums: Enum[] = new Array<Enum>();
    private _dependencies: ImportedModule[] = new Array<ImportedModule>();
    private _methods = new Array<Method>();
    private _path: string;

    public get interfaces(): Array<Interface> {
        return this._interfaces;
    }

    public get classes(): Array<Class> {
        return this._classes;
    }

    public get modules(): Array<Module> {
        return this._modules;
    }

    public get dependencies(): Array<ImportedModule> {
        return this._dependencies;
    }

    public get methods(): Array<Method> {
        return this._methods;
    }

    public get enums(): Array<Enum> {
        return this._enums;
    }

    public get path(): string {
        return this._path;
    }

    public set path(value: string) {
        this._path = value;
    }

    protected getElementCollection(element: Element): Array<Element> {
        switch ((<any>element.constructor).name) {
            case ClassTypeName:
                return this.classes;
            case ModuleTypeName:
                return this.modules;
            case ImportedModuleTypeName:
                return this.dependencies;
            case MethodTypeName:
                return this.methods;
            case EnumTypeName:
                return this.enums;
            case EnumMemberTypeName:
                return this.enums;
            case InterfaceTypeName:
                return this.interfaces;
        }
        return super.getElementCollection(element);
    }
}

export class Class extends Element {
    private _methods = new Array<Method>();
    private _properties: { [name: string]: Property } = {};
    private _extends: QualifiedName;

    public get methods(): Array<Method> {
        return this._methods;
    }

    public get properties(): Array<Property> {
        var result = new Array<Property>();
        for (let prop of Object.keys(this._properties)) {
            result.push(this._properties[prop]);
        }
        return result;
    }

    protected getElementCollection(element: Element): Array<Element> {
        if (element instanceof Method) {
            return this.methods;
        }
        return super.getElementCollection(element);
    }

    public addElement(element: Element) {
        if (element instanceof Property) {
            let property = <Property>element;
            let existingProperty = this._properties[property.name];
            if (existingProperty) {
                existingProperty.hasGetter = existingProperty.hasGetter || property.hasGetter;
                existingProperty.hasSetter = existingProperty.hasSetter || property.hasSetter;
            } else {
                this._properties[property.name] = property;
            }
            return;
        }
        this.getElementCollection(element).push(element);
    }

    public get extends(): QualifiedName {
        return this._extends;
    }

    public set extends(extendingClass: QualifiedName) {
        this._extends = extendingClass;
    }
}

export class Enum extends Element {
    private _members = new Array<EnumMember>();

    public get members(): Array<Method> {
        return this._members;
    }

    protected getElementCollection(element: Element): Array<Element> {
        if (element instanceof EnumMember) {
            return this._members;
        }
        return super.getElementCollection(element);
    }
}


export class EnumMember extends Element {
    private _members = new Array<EnumMember>();

    public get members(): Array<Method> {
        return this._members;
    }

    protected getElementCollection(element: Element): Array<Element> {
        if (element instanceof EnumMember) {
            return this._members;
        }
        return super.getElementCollection(element);
    }
}

export class Method extends Element {

}

export class ImportedModule extends Element {

}

export class Interface extends Element {

}

export class Property extends Element {
    private _hasGetter: boolean;
    private _hasSetter: boolean;

    public get hasGetter(): boolean {
        return this._hasGetter;
    }

    public set hasGetter(value: boolean) {
        this._hasGetter = value;
    }

    public get hasSetter(): boolean {
        return this._hasSetter;
    }

    public set hasSetter(value: boolean) {
        this._hasSetter = value;
    }
}

function typeName(_class: any) {
    return _class.prototype.constructor.name
}

ModuleTypeName = typeName(Module);
ClassTypeName = typeName(Class);
MethodTypeName = typeName(Method);
PropertyTypeName = typeName(Property);
EnumTypeName = typeName(Enum);
EnumMemberTypeName = typeName(EnumMember);
ImportedModuleTypeName = typeName(ImportedModule);
InterfaceTypeName = typeName(Interface);
