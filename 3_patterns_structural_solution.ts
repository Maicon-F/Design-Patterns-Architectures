import inquirer from "inquirer";

// ProductComponent interface
interface ProductComponent {
    display(): string;
    getPrice(): number;
    getCode(): string;
}

// Individual Product
class Product implements ProductComponent {
    constructor(private code: string, public name: string, private price: number) {}

    display(): string {
        return `Product: ${this.name} (Price: $${this.price})`;
    }

    getPrice(): number {
        return this.price;
    }

    getCode(): string {
        return this.code
    }
}

// Product Bundle
class ProductBundle implements ProductComponent {
    private children: ProductComponent[] = [];

    constructor(public code: string, public name: string) {}

    add(child: ProductComponent): void {
        this.children.push(child);
    }

    display(): string {
        return `Bundle: ${this.name}\n` + this.children.map(child => `  ${child.display()}`).join('\n');
    }

    getPrice(): number {
        return this.children.reduce((total, child) => total + child.getPrice(), 0);
    }

    getCode(): string {
        return this.code
    }
}

class ProductComponentManager<T extends ProductComponent> {
    products: T[]

    constructor(){
        this.products = []
    }

    getProduct(code: string){
        const product = this.products.find(p => p.getCode() === code);
        return product
    }

    addProduct(product: T){
        this.products.push(product)
    }

    deleteProduct(code: string){
        const product = this.getProduct(code)
        this.products = this.products.filter(p => p.getCode() !== code);
        return product
    }
}


// Create a SpecialOffer adpater to the ProductComponent
class DiscountedProduct {
    
    constructor(private offerName: string, private discountRate: number, private originalProduct: Product) {}

    getDetails(): string {
        return `Special Offer: ${this.offerName} (Discount: ${this.discountRate}%)   -  product code:(${this.originalProduct.getCode()})`;
    }

    getDiscountedPrice(): number {
          return this.originalProduct.getPrice() * (1 - this.discountRate/100);
    }

    getCode():string{
        return this.originalProduct.getCode();
    }
}


class DiscountedProductAdapter implements ProductComponent {

    constructor(private specialOffer: DiscountedProduct){}

    display(): string {
        return this.specialOffer.getDetails();
    //   throw new Error("Method not implemented.");
    }

    getPrice(): number {
       return this.specialOffer.getDiscountedPrice();
    }

    getCode(): string {
        return this.specialOffer.getCode();
    }
}


class ProductFacade {
   private pm: ProductComponentManager<Product>;
   private pbm: ProductComponentManager<ProductBundle>;
   private discountManager: ProductComponentManager<ProductComponent>;

    public constructor(pm: ProductComponentManager<Product>, pbm: ProductComponentManager<ProductBundle>, discountManager: ProductComponentManager<ProductComponent> ){
        this.pm = pm;
        this.pbm = pbm;
        this.discountManager = discountManager;
    }

    public addProduct(name: string, code: string, price: number){
        const prod = new Product(code, name, price);
        this.pm.addProduct(prod);
    }

    public addBundle(name: string, code: string, productCode: string[]){
        const pb = new ProductBundle(code, name);
       
        productCode.forEach(code => {
           const product = this.pbm.getProduct(code);

           if(product){
            pb.add(product);
           }else{
            console.log("something went wront while creating bundle. No product found to be added.");
           }
           
        });

        this.pbm.addProduct(pb);
       
    }

    public getAllProducts(){
        const products = this.pm.products;
       console.table(products);
    }

    public getAllBundles(){
        console.table(this.pbm.products)
    }

    public addDiscount(offer:string, discount:number, code:string){
        const product = this.pm.getProduct(code) as Product;

        if(product == null){
            return console.log(`\n No product found with provided code! ${code}\n` );
        }
            
        const discountedProduct = new DiscountedProduct(offer, discount, product);       
        this.discountManager.addProduct(new DiscountedProductAdapter(discountedProduct));
    }

    public getAllDiscounts(){
        let discountedProducts = this.discountManager.products as DiscountedProductAdapter[];
        
        discountedProducts.forEach(p =>{
            console.log(p.display());
        }) 
    }

}

const productManager = new ProductComponentManager<Product>()
const productBundleManager = new ProductComponentManager<ProductBundle>()
const discontManager = new ProductComponentManager<DiscountedProductAdapter>()

class ProductFacadeSingleton{
    private static instance: ProductFacade;

    public getInstance() :ProductFacade{
        if(ProductFacadeSingleton.instance == null){
            ProductFacadeSingleton.instance = new ProductFacade(productManager, productBundleManager, discontManager);
        }

        return ProductFacadeSingleton.instance;
    }
    
}


class CommandLineInterface {

    productFacade: ProductFacade;

    constructor(pfi:ProductFacadeSingleton){
        this.productFacade = pfi.getInstance();
    }

    async addProduct(){
        const answers = await inquirer.prompt([
            {
                type: "text",
                name: "name",
                message: "Product Name?"
            },
            {
                type: "text",
                name: "code",
                message: "Product Code?"
            },
            {
                type: "number",
                name: "price",
                message: "Product Price?"
            }
        ])

        const {name, code, price} = answers
        //const name = answers.name
        //const code = answers.code
        //const price = answers.price
        
        this.productFacade.addProduct(name, code, price);
    }

    async askForProductCode(productCode: string[]=[]):Promise<string[]>{

        const {code} = await inquirer.prompt([
            {
                type: "text",
                name: "code",
                message: "Product Code?"
            }
        ])

        if(code){
            productCode.push(code);
            return this.askForProductCode(productCode);
        }else{
            return productCode;
        }


    }

    async addBundle(){
        const answers = await inquirer.prompt([
            {
                type: "text",
                name: "name",
                message: "Bundle Name?"
            },
            {
                type: "text",
                name: "code",
                message: "Bundle Code?"
            }
        ])

        const {name, code} = answers
        //const name = answers.name
        //const code = answers.code
        //const price = answers.price
        const productCode = await this.askForProductCode();
        this.productFacade.addBundle(name, code, productCode);
    }

    getAllProducts(){
        this.productFacade.getAllProducts();
    }

    getAllBundles(){
        this.productFacade.getAllBundles();
    }


    async addDiscount(){
        const answers = await inquirer.prompt([
            {
                type: "text",
                name: "offer",
                message: "Offer Name?"
            },
            {
                type: "number",
                name: "discount",
                message: "Discount rate?"
            },
            {
                type: "string",
                name: "code",
                message: "Product Code?"
            }
        ])

        const {offer, discount, code} = answers
        this.productFacade.addDiscount(offer, discount, code);
    }


    getAllDiscounts(){
        this.productFacade.getAllDiscounts();
    }


    async main(){
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What do you want to do?',
                choices: ['Add Product','Add Product Bundle', 'Add Discount', 'Get All Products', 'Get All Bundles', 'Get All Discounts', 'Exit'],
            }
        ]);
    
        switch (answers.action) {
            case 'Add Product':
                await this.addProduct();
                await this.main();
                break;
            case 'Add Product Bundle':
                await this.addBundle();
                await this.main();
                break;
            case 'Add Discount':
                await this.addDiscount();
                await this.main()
                break;
            case 'Get All Products':
                this.getAllProducts();
                await this.main()
                break;
            case 'Get All Bundles':
                this.getAllBundles();
                await this.main()
                break;
            case 'Get All Discounts':
                await this.getAllDiscounts();
                await this.main()
                break;
            case 'Exit':
                return;
        }
    }
}

const cli = new CommandLineInterface(new ProductFacadeSingleton())
cli.main()