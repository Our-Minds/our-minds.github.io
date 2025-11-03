import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home } from 'lucide-react';
import Layout from '@/components/layout/Layout';

interface FeatureDisabledPageProps {
  featureName: string;
  description: string;
  icon?: React.ReactNode;
}

export function FeatureDisabledPage({ 
  featureName, 
  description,
  icon = <AlertTriangle className="h-12 w-12 text-muted-foreground" />
}: FeatureDisabledPageProps) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-4">
                {icon}
              </div>
              <CardTitle className="text-2xl font-bold">
                {featureName} Temporarily Unavailable
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                This feature has been temporarily disabled by the administrators. 
                Please check back later or contact support for more information.
              </p>
              <Link to="/home">
                <Button className="w-full" variant="default">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}