interface Ifield { 
    rules: Array<any>;
    value: string; 
}

interface Ivalidate {
    fields: Record<string, Ifield>;
}


interface Irule {
    name: string;
    validate: (str: string) => string|false
}


export default function validate({ fields }: Ivalidate){
    let errors = {}
    Object.keys(fields).forEach((key: string) => {
        const field: Ifield = fields[key]
        errors = {
            ...errors,
            [key]: ''
        }  
        errors = field.rules.reduce((acc, rule: Irule) => {
            const error = rule.validate(field.value)
            if(error){
                return {
                    ...acc,
                    [key]: {
                        ...acc[key],
                        [rule.name]: error,
                    },
                }      
            } else {
                return acc
            }
        }, errors)
    })

    const isValid = !Object.values(errors).some(err => err)

    return {
        isValid,
        validationErrors: errors
    }
}    
