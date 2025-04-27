import { NavigationBar } from "@/components/NavigationBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PitchingLearning = () => {
  return (
    <>
      <NavigationBar variant="dashboard" />
      <div className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-3xl font-bold text-center mb-8">Baseball Pitching Guide</h1>

        <div className="grid gap-6">
          {/* Grip Fundamentals */}
          <Card>
            <CardHeader>
              <CardTitle>Grip Fundamentals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Hold the baseball with your fingertips resting across the seams — not deep in your palm.
                A loose but firm grip improves control, velocity, and pitch movement.
                Your index and middle fingers should apply most of the pressure, while the thumb supports underneath.
              </p>
              <p className="text-gray-600 mt-2">
                Practice different grips (e.g., four-seam fastball, two-seam fastball, changeup) to understand how seam orientation affects ball behavior.
              </p>
            </CardContent>
          </Card>

          {/* Proper Stance */}
          <Card>
            <CardHeader>
              <CardTitle>Proper Stance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Begin with your feet shoulder-width apart, standing sideways toward your target (glove side facing home plate).
                Keep your knees slightly bent and your center of gravity low to maintain balance.
                Eyes should stay level and focused on the target at all times.
              </p>
              <p className="text-gray-600 mt-2">
                Distribute about 60% of your weight on your back foot to allow for a strong drive forward.
              </p>
            </CardContent>
          </Card>

          {/* Pitching Motion */}
          <Card>
            <CardHeader>
              <CardTitle>Pitching Motion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                1. Begin with a smooth and controlled wind-up, minimizing unnecessary movements.<br />
                2. Lift your front leg (lead leg) to generate momentum without sacrificing balance.<br />
                3. As you stride forward, drive off your back leg powerfully toward the plate.<br />
                4. Keep your front shoulder closed and pointed toward the catcher until just before release.<br />
                5. Snap your wrist at release for added velocity and spin.<br />
                6. Finish your motion with a full follow-through, allowing your throwing hand to come across your body naturally.<br />
                7. End in a balanced fielding position, ready to react to a hit.
              </p>
            </CardContent>
          </Card>

          {/* Common Mistakes to Avoid */}
          <Card>
            <CardHeader>
              <CardTitle>Common Mistakes to Avoid</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Rushing your delivery — causes loss of control and power.</li>
                <li>Opening your front side too early — exposes your pitch and decreases velocity.</li>
                <li>Failing to follow through — reduces pitch speed and increases injury risk.</li>
                <li>Gripping the ball too tightly — stiffens your wrist and reduces spin.</li>
                <li>Poor balance during wind-up — leads to inaccurate throws and mechanical inefficiency.</li>
                <li>Overthrowing — trying too hard to throw hard can break your form and increase stress on your arm.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Bonus Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Bonus Tips for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Focus on throwing strikes first before adding velocity.</li>
                <li>Use your legs and core to generate power, not just your arm.</li>
                <li>Work on developing a consistent pre-pitch routine to stay mentally focused.</li>
                <li>Record yourself pitching to identify mechanical issues.</li>
                <li>Stay consistent with arm care routines (long toss, band work, stretching) to prevent injuries.</li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
};

export default PitchingLearning;
