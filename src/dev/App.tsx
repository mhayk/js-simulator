import { useState } from "react";
import { Button, Card, Input, Stack } from "../index";

/** Local playground for eyeballing components during development. */
export function App() {
  const [name, setName] = useState("");

  return (
    <div className="ds-root" style={{ minHeight: "100vh", padding: "2.5rem" }}>
      <Stack gap="xl" style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ margin: 0 }}>js-simulator design system</h1>

        <Card title="Buttons" subtitle="Variants and sizes">
          <Stack gap="md">
            <Stack direction="horizontal" gap="sm" wrap align="center">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </Stack>
            <Stack direction="horizontal" gap="sm" wrap align="center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </Stack>
          </Stack>
        </Card>

        <Card title="Inputs" subtitle="Label, hint, and error states">
          <Stack gap="lg">
            <Input
              label="Name"
              placeholder="Ada Lovelace"
              hint="As it should appear in the report."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email"
              placeholder="you@example.com"
              error="Please enter a valid email address."
            />
          </Stack>
        </Card>

        <Card title="Interactive card" subtitle="Hover me" interactive>
          Cards compose the other primitives and elevate on hover.
        </Card>
      </Stack>
    </div>
  );
}
