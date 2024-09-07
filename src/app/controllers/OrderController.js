import * as Yup from 'yup';
import Order from '../schemas/Order';
import Product from '../models/Product';
import Category from '../models/Category'; 

class OrderController {
    async store(request, response) {
        const schema = Yup.object({
            products: Yup.array()
            .required()
            .of(
                Yup.object({
                    id: Yup.number().required(),
                    quantity: Yup.number().required(),
                }),
            ),
        });


        try {
            schema.validateSync(request.body, { abortEarly: false });
        } catch (err) {
            return response.status(400).json({ error: err.errors });
        }


        const { products } = request.body;

        const productsIds = products.map((product) => product.id);

        const findProducts = await Product.findAll({
            where: {
                id: productsIds,
            },

            include: [
                {
                    model: Category,
                    as: 'category',
                    atributes: ['name'],
                },
            ],
        });

        const formattedProducts = findProducts.map(product => {
            const newProduct = {
                id: product.id,
                name: product.name,
                category: product.category ? product.category.name : null,
                price: product.price,
                url: product.url,
            };

            return newProduct;
        })

        const order = {
            user: {
                id: request.userId,
                name: request.userName,
            },

            products: formattedProducts,
        };

        return response.status(201).json(order);
    }
}



export default new OrderController();