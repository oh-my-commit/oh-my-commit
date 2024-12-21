import "reflect-metadata"
import { Container, Inject, Service, Token } from "typedi"

// Define interfaces
interface ILogger {
  log(message: string): void
}

interface IUserData {
  id: number
  name: string
}

// Create tokens
const LoggerService = new Token<ILogger>()

// Define logger service
@Service({ id: LoggerService })
class Logger implements ILogger {
  log(message: string): void {
    console.log(`[Logger]: ${message}`)
  }
}

// User service with logger dependency
@Service()
class UserService {
  constructor(@Inject(LoggerService) private readonly logger: ILogger) {}

  createUser(data: IUserData): void {
    this.logger.log(`Creating user: ${data.name}`)
    // Simulate user creation
    this.logger.log(`User ${data.name} created successfully with ID: ${data.id}`)
  }
}

// Example usage
async function main() {
  try {
    // Reset container
    Container.reset()

    // Register logger service
    Container.set({ id: LoggerService, value: new Logger() })

    // Get service instance
    const userService = Container.get(UserService)

    // Use the service
    userService.createUser({
      id: 1,
      name: "John Doe",
    })
  } catch (error) {
    console.error("Error details:", error)
  }
}

// Run the demo
main().catch(console.error)
