import inquirer from 'inquirer';

type RequirementDescription = {
    code: string
    description: string
}

class RequirementsDocument {
    author?: string
    name?: string
    project?: string
    requirements?: RequirementDescription[]

    print(){
        console.log(`Document:${this.name}`)
        console.log(`Author:${this.author}`)
        console.log(`Project:${this.project}`)
        console.table(this.requirements);
    }
}

class RequirementDocumentBuilder{
    author?: string;
    name?: string;
    project?: string;
    requirements?: RequirementDescription[] = [];

    withRequirements(rd: RequirementDescription){
       this.requirements?.push(rd); 
    }

    withAuthor(author: string | undefined){
        this.author = author;
        return this;
    }

    withName(name:string){
        this.name = name;
        return this;
    }

    withProject(project:string){
        this.project = project;
        return this;
    }



    build(){
        const doc = new RequirementsDocument();
        doc.name = this.name;
        doc.author = this.author;
        doc.project = this.project;
        doc.requirements = this.requirements;
        console.table("requirements" + this.requirements);

        return doc;
    }

        
}

/** Exercise **/
/** Use a creational pattern to create an instance of RequirementsDocument **/
/** Example: Factory, Builder or Singleton **/
class CommandLineInterface {

    builder: RequirementDocumentBuilder;

    constructor( builder: RequirementDocumentBuilder){
        this.builder = builder;
    }


    async addAuthor(){
            const data = await inquirer.prompt([
                {
                    type: 'text',
                    name: 'author',
                    message: 'Document Author?',
                }
            ]);
    
            const rd = this.builder.withAuthor(data.author);        
            console.log(`New Author added ${rd.author}`);   
    }

    async addName(){
        const data = await inquirer.prompt([
            {
                type: 'text',
                name: 'name',
                message: 'Document Name?',
            }
        ]);

        const rd = this.builder.withName(data.name);        
        console.log(`Added ${rd.name}`);   
    }

    async addProject(){
        const data = await inquirer.prompt([
            {
                type: 'text',
                name: 'name',
                message: 'Document Project?',
            }
        ]);

        const rd = this.builder.withProject(data.name);        
        console.log(`Added ${rd.project}`);   
    }

    async addRequirement(){
        const data = await inquirer.prompt([
            {
                type: 'text',
                name: 'code',
                message: 'Requirement code?',
            },
            {
                type: 'text',
                name: 'description',
                message: 'Requirement description?',
            }
        ]);

        const requirementDescription: RequirementDescription = {
            code: data.code,
            description: data.description
        };
        
        const rd = this.builder.withRequirements(requirementDescription);        
        console.log(`New requirement description successfully added with code ${requirementDescription.code} and description equals to "${requirementDescription.description}"`);   
    }

    create(){
        const doc = this.builder.build();
        doc.print();
    }




    async main(){
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What do you want to do?',
                choices: ['Add Author','Add Name', 'Add Project', 'Add Requirements', 'Create', 'Exit'],
            }
        ]);
    
        switch (answers.action) {
            case 'Add Author':
                await this.addAuthor();
                this.main()
                break;
            case 'Add Name':
                await this.addName();
                this.main()
                break;
            case 'Add Project':
                await this.addProject();
                this.main()
                break;
            case 'Add Requirements':
                await this.addRequirement();
                this.main()
                break;
            case 'Create':
                this.create();
                // Execute requirementsDocument.print() to get the final output
                break;
            case 'Exit':
                return;
        }
    }
}

const cli = new CommandLineInterface(new RequirementDocumentBuilder())
cli.main()