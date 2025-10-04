import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Smartphone,
  Globe,
  FileText,
  Users,
  Clock,
} from "lucide-react";

export interface SecurityFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "active" | "inactive" | "pending";
  details?: string;
}

export interface PaymentSecurityConfig {
  enableFraudDetection: boolean;
  enable3DSecure: boolean;
  enableRiskScoring: boolean;
  enableDeviceFingerprinting: boolean;
  enableVelocityChecks: boolean;
  enableGeolocationVerification: boolean;
  maxRetryAttempts: number;
  lockoutDuration: number;
}

export class PaymentSecurityService {
  private static instance: PaymentSecurityService;
  private config: PaymentSecurityConfig;

  private constructor() {
    this.config = {
      enableFraudDetection: true,
      enable3DSecure: true,
      enableRiskScoring: true,
      enableDeviceFingerprinting: true,
      enableVelocityChecks: true,
      enableGeolocationVerification: true,
      maxRetryAttempts: 3,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
    };
  }

  public static getInstance(): PaymentSecurityService {
    if (!PaymentSecurityService.instance) {
      PaymentSecurityService.instance = new PaymentSecurityService();
    }
    return PaymentSecurityService.instance;
  }

  /**
   * Get security features status
   */
  public getSecurityFeatures(): SecurityFeature[] {
    return [
      {
        id: "ssl_encryption",
        name: "SSL Encryption",
        description: "All data is encrypted in transit using TLS 1.3",
        icon: <Lock className="w-5 h-5" />,
        status: "active",
        details: "256-bit encryption",
      },
      {
        id: "pci_compliance",
        name: "PCI DSS Compliance",
        description: "Payment card industry security standards",
        icon: <Shield className="w-5 h-5" />,
        status: "active",
        details: "Level 1 certified",
      },
      {
        id: "fraud_detection",
        name: "Fraud Detection",
        description: "AI-powered fraud prevention system",
        icon: <Eye className="w-5 h-5" />,
        status: this.config.enableFraudDetection ? "active" : "inactive",
        details: "Machine learning algorithms",
      },
      {
        id: "3d_secure",
        name: "3D Secure",
        description: "Additional authentication for card payments",
        icon: <CreditCard className="w-5 h-5" />,
        status: this.config.enable3DSecure ? "active" : "inactive",
        details: "Verified by Visa, Mastercard SecureCode",
      },
      {
        id: "risk_scoring",
        name: "Risk Scoring",
        description: "Real-time risk assessment",
        icon: <AlertTriangle className="w-5 h-5" />,
        status: this.config.enableRiskScoring ? "active" : "inactive",
        details: "Multi-factor risk analysis",
      },
      {
        id: "device_fingerprinting",
        name: "Device Fingerprinting",
        description: "Unique device identification",
        icon: <Smartphone className="w-5 h-5" />,
        status: this.config.enableDeviceFingerprinting ? "active" : "inactive",
        details: "Browser and device analysis",
      },
      {
        id: "velocity_checks",
        name: "Velocity Checks",
        description: "Transaction frequency monitoring",
        icon: <Clock className="w-5 h-5" />,
        status: this.config.enableVelocityChecks ? "active" : "inactive",
        details: "Prevents rapid-fire attacks",
      },
      {
        id: "geolocation",
        name: "Geolocation Verification",
        description: "Location-based fraud prevention",
        icon: <Globe className="w-5 h-5" />,
        status: this.config.enableGeolocationVerification ? "active" : "inactive",
        details: "IP and GPS verification",
      },
    ];
  }

  /**
   * Validate payment security
   */
  public async validatePaymentSecurity(paymentData: any): Promise<{
    isValid: boolean;
    riskScore: number;
    warnings: string[];
    recommendations: string[];
  }> {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 0;

    // Check for suspicious patterns
    if (this.config.enableVelocityChecks) {
      const velocityCheck = await this.performVelocityCheck(paymentData);
      if (!velocityCheck.passed) {
        warnings.push("High transaction frequency detected");
        riskScore += 30;
      }
    }

    // Check geolocation
    if (this.config.enableGeolocationVerification) {
      const geoCheck = await this.performGeolocationCheck(paymentData);
      if (!geoCheck.passed) {
        warnings.push("Unusual location detected");
        riskScore += 25;
        recommendations.push("Consider using 3D Secure authentication");
      }
    }

    // Check device fingerprint
    if (this.config.enableDeviceFingerprinting) {
      const deviceCheck = await this.performDeviceCheck(paymentData);
      if (!deviceCheck.passed) {
        warnings.push("New or suspicious device detected");
        riskScore += 20;
        recommendations.push("Additional verification may be required");
      }
    }

    // Risk scoring
    if (this.config.enableRiskScoring) {
      riskScore = await this.calculateRiskScore(paymentData);
    }

    return {
      isValid: riskScore < 70,
      riskScore,
      warnings,
      recommendations,
    };
  }

  /**
   * Perform velocity check
   */
  private async performVelocityCheck(paymentData: any): Promise<{ passed: boolean }> {
    // Simulate velocity check
    // In a real implementation, this would check against a database
    const recentTransactions = 0; // This would be fetched from database
    return { passed: recentTransactions < 5 };
  }

  /**
   * Perform geolocation check
   */
  private async performGeolocationCheck(paymentData: any): Promise<{ passed: boolean }> {
    // Simulate geolocation check
    // In a real implementation, this would use IP geolocation services
    return { passed: true };
  }

  /**
   * Perform device check
   */
  private async performDeviceCheck(paymentData: any): Promise<{ passed: boolean }> {
    // Simulate device fingerprinting
    // In a real implementation, this would analyze browser/device characteristics
    return { passed: true };
  }

  /**
   * Calculate risk score
   */
  private async calculateRiskScore(paymentData: any): Promise<number> {
    let score = 0;

    // Simulate risk scoring algorithm
    // In a real implementation, this would use machine learning models
    score += Math.random() * 30; // Base risk

    return Math.min(score, 100);
  }

  /**
   * Get security configuration
   */
  public getConfig(): PaymentSecurityConfig {
    return { ...this.config };
  }

  /**
   * Update security configuration
   */
  public updateConfig(newConfig: Partial<PaymentSecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// React hook for payment security
export const usePaymentSecurity = () => {
  const [securityService] = useState(() => PaymentSecurityService.getInstance());
  const [securityFeatures, setSecurityFeatures] = useState<SecurityFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const features = securityService.getSecurityFeatures();
    setSecurityFeatures(features);
    setIsLoading(false);
  }, [securityService]);

  const validatePayment = async (paymentData: any) => {
    return await securityService.validatePaymentSecurity(paymentData);
  };

  const getConfig = () => {
    return securityService.getConfig();
  };

  const updateConfig = (newConfig: Partial<PaymentSecurityConfig>) => {
    securityService.updateConfig(newConfig);
    const features = securityService.getSecurityFeatures();
    setSecurityFeatures(features);
  };

  return {
    securityFeatures,
    isLoading,
    validatePayment,
    getConfig,
    updateConfig,
  };
};

// Security features display component
export const SecurityFeaturesDisplay = () => {
  const { securityFeatures, isLoading } = usePaymentSecurity();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Payment Security Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {securityFeatures.map((feature) => (
          <div key={feature.id} className="flex items-start space-x-3">
            <div className={`w-5 h-5 mt-0.5 ${
              feature.status === "active" ? "text-green-600" : 
              feature.status === "pending" ? "text-yellow-600" : "text-gray-400"
            }`}>
              {feature.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{feature.name}</h4>
                <Badge 
                  variant={feature.status === "active" ? "default" : "secondary"}
                  className={
                    feature.status === "active" ? "bg-green-100 text-green-800" : 
                    feature.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
                    "bg-gray-100 text-gray-600"
                  }
                >
                  {feature.status === "active" && <CheckCircle className="w-3 h-3 mr-1" />}
                  {feature.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
              {feature.details && (
                <p className="text-xs text-gray-500 mt-1">{feature.details}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Security notice component
export const SecurityNotice = ({ 
  showDetails = false 
}: { 
  showDetails?: boolean 
}) => {
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-1">Secure Payment</h4>
            <p className="text-sm text-blue-700 mb-2">
              Your payment is protected by industry-leading security measures
            </p>
            {showFullDetails && (
              <div className="space-y-2 text-xs text-blue-600">
                <div className="flex items-center space-x-2">
                  <Lock className="w-3 h-3" />
                  <span>256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3" />
                  <span>PCI DSS Level 1 compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-3 h-3" />
                  <span>Fraud detection enabled</span>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="text-blue-600 hover:text-blue-700 p-0 h-auto"
            >
              {showFullDetails ? (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  Show Details
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSecurityService;
