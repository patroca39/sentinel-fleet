from pydantic import BaseModel, Field

class FuelReceiptExtraction(BaseModel):
    reasoning_log: str = Field(
        ..., 
        description="Step-by-step mathematical reasoning validating the fuel volume and cost based on the receipt before outputting float values."
    )
    odometer: float | None = Field(default=None, description="Odometer reading.")
    date: str | None = Field(default=None, description="Date in YYYY-MM-DD format.")
    cost: float | None = Field(default=None, description="Total cost of the fuel.")
    fuel_liters: float | None = Field(default=None, description="Total fuel liters purchased.")
    shop_name: str | None = Field(default=None, description="Name of the gas station.")

class MaintenanceReceiptExtraction(BaseModel):
    reasoning_log: str = Field(
        ..., 
        description="Step-by-step mathematical reasoning validating the itemized services, parts, and labor sum against the total cost before outputting float values."
    )
    odometer: float | None = Field(default=None, description="Odometer reading.")
    date: str | None = Field(default=None, description="Date in YYYY-MM-DD format.")
    total_cost: float | None = Field(default=None, description="Total cost of maintenance.")
    shop_name: str | None = Field(default=None, description="Name of the repair shop.")
    services: str | None = Field(
        default=None, 
        description="Comma-separated list of Services Performed with individual prices, e.g., 'Oil Change - ₱1500, Air Filter - ₱800'."
    )
