import React from "react";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Terms and Conditions</h1>

      <Section title="1. Definitions">
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>User</strong>: Any individual or entity using the platform.</li>
          <li><strong>We / Us</strong>: Refers to RentEase.</li>
          <li><strong>Landlord</strong>: Users who list rental properties.</li>
          <li><strong>Tenant</strong>: Users seeking to rent properties.</li>
          <li><strong>Content</strong>: Any material uploaded or shared via the platform.</li>
        </ul>
      </Section>

      <Section title="2. Eligibility">
        <p>You must be at least 18 years old to use RentEase. By using the platform, you confirm that you can form a binding contract.</p>
      </Section>

      <Section title="3. Account Registration">
        <p>
          To access features, users must register an account, providing accurate and updated information. You are responsible for all activity under your account and for maintaining the confidentiality of your login credentials.
        </p>
      </Section>

      <Section title="4. User Roles and Switching">
        <p>
          Users may have both "tenant" and "landlord" roles within one account. All role-based activity must follow these Terms.
        </p>
      </Section>

      <Section title="5. Listings and Bookings">
        <p>
          Landlords are responsible for the accuracy of listings. RentEase does not own or control the listed properties. Agreements between tenants and landlords are independent of RentEase.
        </p>
      </Section>

      <Section title="6. Fees and Payments">
        <p>
          Service fees may apply and will be disclosed clearly. Users agree to pay all applicable charges. Payments are managed by third-party processors, and RentEase is not liable for any transaction issues.
        </p>
      </Section>

      <Section title="7. Cancellations and Refunds">
        <p>
          Each landlord may define their cancellation policy. RentEase does not guarantee refunds and encourages tenants to review terms before booking.
        </p>
      </Section>

      <Section title="8. User Conduct">
        <ul className="list-disc pl-6 space-y-2">
          <li>Do not violate laws or regulations.</li>
          <li>Do not post misleading or harmful content.</li>
          <li>Do not infringe others' rights.</li>
          <li>Do not engage in fraudulent activity.</li>
        </ul>
      </Section>

      <Section title="9. Content Ownership and License">
        <p>
          Users own the content they upload but grant RentEase a non-exclusive license to use and display it within the platform.
        </p>
      </Section>

      <Section title="10. Termination">
        <p>
          We may suspend or terminate accounts at our discretion, especially if you violate these Terms.
        </p>
      </Section>

      <Section title="11. Disclaimer and Limitation of Liability">
        <p>
          RentEase provides services "as-is" and does not guarantee availability or accuracy. We are not liable for property conditions or user behavior.
        </p>
      </Section>

      <Section title="12. Indemnification">
        <p>
          You agree to indemnify RentEase against claims, damages, or losses arising from your use of the platform or breach of these Terms.
        </p>
      </Section>

      <Section title="13. Changes to Terms">
        <p>
          We may update these Terms at any time. Continued use after changes implies acceptance.
        </p>
      </Section>

      <Section title="14. Governing Law">
        <p>
          These Terms are governed by the laws of [Insert Country/State].
        </p>
      </Section>

      <Section title="15. Contact Us">
        <p>
          If you have questions about these Terms, contact us at:
          <br />
          <strong>Email:</strong> support@rentease.com<br />
          <strong>Phone:</strong> [Insert Phone Number]<br />
          <strong>Address:</strong> [Insert Address]
        </p>
      </Section>
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <div className="text-gray-700 text-base">{children}</div>
  </div>
);

export default TermsAndConditions;
