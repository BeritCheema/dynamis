
import { NavigationBar } from "@/components/NavigationBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PitchingLearning = () => {
  return (
    <>
      <NavigationBar variant="dashboard" />
      <div className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-3xl font-bold text-center mb-8">Baseball Pitching Guide</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Grip Fundamentals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Hold the baseball with your fingertips across the seams, not in your palm. 
                This gives you better control and allows for maximum finger pressure when releasing the ball.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proper Stance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Start with feet shoulder-width apart, standing sideways to your target.
                Your weight should be balanced, with slightly more on your back leg.
                Keep your shoulders level and relaxed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pitching Motion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                1. Begin with a smooth wind-up<br/>
                2. Drive forward with your back leg<br/>
                3. Keep your front side closed until release<br/>
                4. Follow through completely after release<br/>
                5. End in a balanced fielding position
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Mistakes to Avoid</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Rushing your delivery</li>
                <li>Opening your front side too early</li>
                <li>Not following through</li>
                <li>Gripping the ball too tightly</li>
                <li>Poor balance during wind-up</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PitchingLearning;
