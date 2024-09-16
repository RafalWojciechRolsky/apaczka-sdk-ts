# apaczka-sdk-ts

TypeScript SDK for Apaczka API

## Description

apaczka-sdk-ts is a TypeScript library that provides a simple and type-safe way to interact with the Apaczka API. It allows easy integration with Apaczka's shipping services, including order management, waybill generation, pickup scheduling, and more.

## Available Methods

The SDK provides the following methods:

- `order(id: string)`: Get details of a specific order
- `orders(page?: number, limit?: number)`: List orders
- `waybill(id: string)`: Get waybill for an order
- `pickupHours(postalCode: string, serviceId?: string)`: Get available pickup hours
- `orderValuation(order: OrderRequest)`: Get order valuation
- `orderSend(order: OrderRequest)`: Send a new order
- `cancelOrder(id: string)`: Cancel an order
- `serviceStructure()`: Get service structure
- `points(type?: string)`: Get pickup/delivery points
- `customerRegister(customer: Record<string, unknown>)`: Register a new customer
- `turnIn(orderIds: string[])`: Turn in orders

## Development

To set up the project for development:

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build the project: `pnpm run build`
4. Run tests: `pnpm test`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
