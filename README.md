# apaczka-sdk-ts

TypeScript SDK for Apaczka API

## Description

apaczka-sdk-ts is a TypeScript library that provides a simple and type-safe way to interact with the Apaczka API. It allows easy integration with Apaczka's shipping services, including order management, waybill generation, pickup scheduling, and more.

## Environment

apaczka-sdk-ts is designed to work in a Node.js environment. It's built with TypeScript and targets modern JavaScript environments. Here are some key points about the SDK's environment:

- **Runtime**: Node.js (version 14.x or higher recommended)
- **Language**: TypeScript (compiled to JavaScript)
- **Module System**: CommonJS
- **API Communication**: Uses the `axios` library for HTTP requests
- **Dependencies**:
  - `dotenv` for environment variable management
  - TypeScript and related dev dependencies for development and building

### Configuration

The SDK uses environment variables for configuration. It expects the following variables to be set:

- `APP_ID`: Your Apaczka application ID
- `APP_SECRET`: Your Apaczka application secret
- `API_URL`: The base URL for the Apaczka API (default: https://api.apaczka.com/v1/)

You can set these variables in a `.env` file in your project root, or provide them through your deployment environment.

### TypeScript Configuration

The project uses a `tsconfig.json` file with the following key settings:

- Target: ES2018
- Module: CommonJS
- Strict mode enabled
- Source maps generated

This configuration ensures compatibility with most Node.js environments while providing strong type checking during development.

## API Docs & Client Guidelines:

- [API Docs](https://panel.apaczka.pl/dokumentacja_api_v2.php)
- [API Client Guidelines](https://www.apaczka.pl/app/uploads/2022/12/Zalecenia-dla-klientow-API.pdf)

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

## API Endpoints

The following endpoints are available in the Express server:

- `POST /api/apaczka/order-valuation`: Get order valuation
- `POST /api/apaczka/order-send`: Send a new order

## greasy Script

A (Greasy script)[https://greasyfork.org/pl] is included to facilitate the interaction between the frontend and the backend. This script is designed to be used on the `sote CMS backend` website and provides a form for users to input shipping details directly on the order edit page. Once the form is filled out, the script sends the data to the backend API to create a shipping order.

- **Script Name**: `greasyScriptForApaczka`
- **Purpose**: To send shipping data from the frontend (sote CMS backend) to the backend (this app) for order processing.
- **Integration**: The script interacts with the backend by sending a POST request to the `/api/apaczka` endpoint with the shipping details.

## Development

To set up the project for development:

1. Clone the repository
2. Install dependencies: `pnpm i`
3. Build the project: `pnpm build`
4. Run the project: `pnpm start`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Author

[Rafał Majewski | skladmuzyczny.pl](https://skladmuzyczny.pl)
